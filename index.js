import fs from "node:fs";
import gkm from "gkm";

let bossesKilled = 0;
let pbBossesKilled = 0;
let ctrlPressed = false;

const pbFile = "pb.json";
const obsTextFile = "obs.txt";

function init() {
  fs.readFile(pbFile, "utf8", (err, data) => {
    if (err) {
      updateBosskillsAndFiles(0, 0);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      bossesKilled = jsonData.bosses;
      pbBossesKilled = jsonData.pb;
      updateBosskillsAndFiles(bossesKilled ?? 0, pbBossesKilled ?? 0);
    } catch {
      updateBosskillsAndFiles(0, 0);
      return;
    }
  });
}

function updateBosskillsAndFiles(bosses, pb) {
  bossesKilled = bosses;
  pbBossesKilled = bosses > pb ? bosses : pb;
  writeToFile(pbFile, `{"pb": ${pbBossesKilled}, "bosses": ${bossesKilled}}`);
  writeToFile(obsTextFile, `Bosses killed: ${bossesKilled} \nPB: ${pbBossesKilled}`);
}

function writeToFile(file, content) {
  fs.writeFile(file, content, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

init();
process.stdout.write("\x1Bc");
console.log("Numpad + to add to boss kills");
console.log("Numpad - to subtract from boss kills");
console.log("CTRL + R to reset current run");
console.log("CTRL + Backspace to reset current run and PB");
console.log("");
console.log("CTRL + Q to quit application");
gkm.events.on("key.*", function (data) {
  const e = this.event;
  const k = data[0].toLowerCase();
  if (e === "key.pressed") {
    if (k === "left control") {
      ctrlPressed = true;
    }

    if (ctrlPressed && (k === "q" || k === "c")) {
      process.exit();
    }

    if (ctrlPressed && k === "r") {
      console.log("Resetting run");
      updateBosskillsAndFiles(0, pbBossesKilled);
      return;
    }

    if (ctrlPressed && k === "backspace") {
      console.log("Resetting everything");
      updateBosskillsAndFiles(0, 0);
      return;
    }

    if (k === "numpad add") {
      console.log("Adding to boss kills");
      updateBosskillsAndFiles(bossesKilled + 1, pbBossesKilled);
    } else if (k === "numpad subtract") {
      console.log("Removing from boss kills");
      updateBosskillsAndFiles(bossesKilled - 1, pbBossesKilled);
    }
  } else if (e === "key.released") {
    if (k === "Left Control") {
      ctrlPressed = false;
    }
  }
});
