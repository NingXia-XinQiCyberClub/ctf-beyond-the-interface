"""Prepare the two local report artifacts shown in the closing animation."""
from pathlib import Path
import json

root=Path(__file__).resolve().parents[1]
evidence=json.loads((root/'src/data/range-evidence.json').read_text(encoding='utf8'))
events={e['id']:e for e in evidence['events']}
assert events['REQ-017']['status']==200 and events['REQ-018']['status']==201
assert events['RETEST-OBJECT']['status']==403 and events['RETEST-ROLE']['status']==403
assert events['RETEST-LEGAL']['status']==200
out=root/'public/reports';out.mkdir(exist_ok=True)
reports={
'red-team-report.md':'''# 鑫启网安俱乐部 · 红队渗透测试报告

## 范围与证据

本地授权HTTP靶场，证据记录：src/data/range-evidence.json。
事件链：REQ-017 → REQ-018 → TASK-042 → ops-01。

## 发现与影响

1. 对象授权缺失：alice访问bob所属记录，REQ-017返回200。
2. 运维角色检查缺失：普通身份创建内置取证任务，REQ-018返回201，TASK-042取回固定证明。

## 修复建议

补齐对象所属者校验，限制运维任务创建角色，修复后分别验证越界请求和正常业务。

## 结论

两项问题及证据链已记录，修复建议已完成，报告归档。
''',
'blue-team-report.md':'''# 鑫启网安俱乐部 · 蓝队防守处置报告

## 告警研判与溯源

本地授权HTTP靶场。关联REQ-017、REQ-018、TASK-042与运维节点ops-01，确认跨身份访问与越权任务。

## 防守处置与加固

入口临时阻断、运维节点隔离；补齐对象授权及运维接口角色检查，随后撤回临时来源封禁再进行应用层复测。

## 修复验证

- 越界访问：403。
- 合法业务：200。
- 非运维角色创建任务：403。
- 临时测试任务已撤除。

## 结论

处置措施、修复与三项复测已记录，证据与报告归档。
'''}
for name,body in reports.items(): (out/name).write_bytes(body.encode('utf8'))
print('Red and blue report artifacts ready.')
