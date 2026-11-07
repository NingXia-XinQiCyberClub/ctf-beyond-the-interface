"""Run the film's real HTTP validation on a disposable loopback-only fixture.

The deliberately weak fixture exists only for this process and uses invented
records. It never executes shell commands or connects to another machine.
"""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import hashlib
import json
import threading
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
state = dict(fixed=False, blocked=False, isolated=False, tasks={})
records = {"101": {"owner": "alice", "project": "门户联调", "classification": "INTERNAL"},
           "202": {"owner": "bob", "project": "运维交接", "classification": "INTERNAL"}}
events = []

class Fixture(BaseHTTPRequestHandler):
    def log_message(self, *args): pass
    def reply(self, code, body):
        data = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code); self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data))); self.end_headers(); self.wfile.write(data)
    def do_GET(self):
        identity = self.headers.get('X-Range-User', 'alice')
        if state['blocked']: return self.reply(403, {'error': 'source blocked', 'control': 'temporary policy'})
        if self.path.startswith('/api/records/'):
            record = records.get(self.path.rsplit('/', 1)[-1])
            if not record: return self.reply(404, {'error': 'not found'})
            if state['fixed'] and record['owner'] != identity:
                return self.reply(403, {'error': 'object access denied', 'control': 'owner authorization'})
            return self.reply(200, record)
        return self.reply(404, {'error': 'not found'})
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))) or '{}')
        if self.path == '/control':
            if self.headers.get('X-Range-Role') != 'defender': return self.reply(403, {'error': 'denied'})
            state.update({k: body[k] for k in ['fixed', 'blocked', 'isolated'] if k in body})
            if body.get('close'): state['tasks'].clear()
            return self.reply(200, {'applied': True})
        if self.path == '/ops/tasks':
            if state['blocked'] or state['isolated']: return self.reply(403, {'error': 'node isolated'})
            if state['fixed'] and self.headers.get('X-Range-Role') != 'operator':
                return self.reply(403, {'error': 'operator role required'})
            if body != {'action': 'read_range_fixture', 'target': 'ops-01'}:
                return self.reply(400, {'error': 'only built-in demo action supported'})
            # Fixed, harmless task: this is a permission flaw, not arbitrary code.
            proof = 'RANGE_ACCESS_VERIFIED'
            state['tasks']['TASK-042'] = proof
            return self.reply(201, {'task': 'TASK-042', 'node': 'ops-01', 'file': 'range-evidence.txt', 'proof': proof})
        return self.reply(404, {'error': 'not found'})

server = ThreadingHTTPServer(('127.0.0.1', 0), Fixture)
thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
def request(key, path, method='GET', payload=None, role='viewer', expected=200):
    data = None if payload is None else json.dumps(payload).encode()
    req = Request(f'http://127.0.0.1:{server.server_port}{path}', data=data, method=method,
                  headers={'X-Range-User': 'alice', 'X-Range-Role': role, 'X-Request-ID': key, 'Content-Type': 'application/json'})
    try:
        response = urlopen(req)
    except HTTPError as error: response = error
    body = json.loads(response.read().decode())
    assert response.status == expected, (key, response.status, body)
    events.append(dict(id=key, method=method, path=path, status=response.status, response=body))
    return body

try:
    request('BASE-001', '/api/records/101')
    request('REQ-017', '/api/records/202')
    request('REQ-018', '/ops/tasks', 'POST', {'action': 'read_range_fixture', 'target': 'ops-01'}, expected=201)
    request('BLUE-001', '/control', 'POST', {'blocked': True, 'isolated': True}, 'defender')
    request('RETEST-BLOCK', '/api/records/202', expected=403)
    request('BLUE-002', '/control', 'POST', {'fixed': True, 'blocked': False, 'isolated': False}, 'defender')
    request('RETEST-OBJECT', '/api/records/202', expected=403)
    request('RETEST-ROLE', '/ops/tasks', 'POST', {'action': 'read_range_fixture', 'target': 'ops-01'}, expected=403)
    request('RETEST-LEGAL', '/api/records/101')
    request('CLOSE-001', '/control', 'POST', {'close': True}, 'defender')
    assert not state['tasks']
finally:
    server.shutdown(); server.server_close(); thread.join()
evidence = dict(scope='Disposable loopback-only HTTP fixture; all records fictional',
                displayHost='portal.range.test (visual alias for local fixture)',
                eventLink=['REQ-017', 'REQ-018', 'TASK-042', 'ops-01'], events=events,
                verified=dict(objectFix=True, roleFix=True, legitimateTraffic=True, temporaryTasksRemoved=True))
target = ROOT/'src/data/range-evidence.json'
target.write_text(json.dumps(evidence, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('Verified local HTTP exercise:', len(events), 'requests;', hashlib.sha256(target.read_bytes()).hexdigest())
