import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";

const handle = delayRender("Load bundled Chinese typography");
const faces = [
  new FontFace("Noto Sans SC", `url("${staticFile("fonts/NotoSansSC.ttf")}")`, {
    weight: "400",
  }),
  new FontFace(
    "Noto Sans SC",
    `url("${staticFile("fonts/NotoSansSC-Bold.ttf")}")`,
    { weight: "700" },
  ),
];
Promise.all(faces.map((face) => face.load()))
  .then((fonts) => {
    for (const font of fonts)
      (document.fonts as unknown as { add: (face: FontFace) => void }).add(
        font,
      );
    continueRender(handle);
  })
  .catch(cancelRender);
