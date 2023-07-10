const m_ = {
  init: function () {
    m_.setData();
    m_.setOptions();
    m_.setDirections();
    ko.track(m_, { deep: true });
    ko.track(m_.points, { deep: true });
    ko.track(m_.currentPoint, { deep: true });
    ko.applyBindings(m_);
  },
  documents: [],
  Point: class Point {
    constructor(text, options) {
      this.text = text;
      this.options = options;
    }
  },
  steps: 0,
  points: [],
  currentPath: [],
  correctPath: [
    "Войти в лабиринт",
    "point1",
    "point2",
    "point3",
    "point4",
    "point5",
    "point6",
    "point7",
  ],
  paths: [
    [["init"]],
    [["Войти в лабиринт"]],
    [["point1", "wrong101"]],
    [["point2", "wrong92"], ["wrong102"]],
    [["point3", "wrong73", "wrong83"], ["wrong93"], []],
    [["point4", "wrong64"], ["wrong74"], [], []],
    [["point5", "wrong45", "wrong55"], ["wrong65"], []],
    [["point6", "wrong36"], ["wrong46"], ["wrong56"], []],
    [["point7", "wrong27"], ["wrong37"], ["wrong47"]],
    [[], ["wrong28"], [], []],
    [[], ["wrong29"]],
    [[], []],
  ],
  forks: [["L", "F", "R"], ["LF", "LR", "FR"], ["LFR"]],
  currentPoint: {},
  currentDirections: [],
  currentForkSrc: `url("img/forks/START.jpg")`,
  currentCharSrc: `url("img/character/F1.png")`,
  win: false,
  setData: function () {
    for (let i = 0; i < m_.paths.length; i++) {
      for (let j = 0; j < m_.paths[i].length; j++) {
        for (let k = 0; k < m_.paths[i][j].length; k++) {
          if (j > 0) {
            m_.points.push(
              new m_.Point(
                m_.paths[i][j][k],
                m_.paths[i + 1][k + m_.paths[i][j - 1].length]
              )
            );
          } else {
            m_.points.push(new m_.Point(m_.paths[i][j][k], m_.paths[i + 1][k]));
          }
        }
      }
    }
    m_.currentPoint = m_.points[0];
    m_.currentPath.push(m_.currentPoint);
    document.addEventListener("keydown", function (event) {
      const currentDirections = m_.currentPoint.options.map(
        (point) => point.direction
      );
      if (
        currentDirections.includes("L") &&
        (event.key === "ArrowLeft" || event.key === "a")
      ) {
        m_.arrowClick("L");
      }
      if (
        currentDirections.includes("F") &&
        (event.key === "ArrowUp" || event.key === "w")
      ) {
        m_.arrowClick("F");
      }
      if (
        currentDirections.includes("R") &&
        (event.key === "ArrowRight" || event.key === "d")
      ) {
        m_.arrowClick("R");
      }
      if (
        m_.currentPath.length > 2 &&
        (event.key === "ArrowDown" || event.key === "s")
      ) {
        m_.arrowClick("B");
      }
    });
  },
  setOptions: function () {
    for (let i = 0; i < m_.points.length; i++) {
      m_.points[i].options = m_.points[i].options.map((option) =>
        m_.points.find((point) => point.text === option)
      );
    }
  },
  setDirections: function () {
    m_.points[0].options[0].direction = "F";
    for (let i = 1; i < m_.points.length; i++) {
      let directions = ["L", "F", "R"];
      for (let j = 0; j < m_.points[i].options.length; j++) {
        m_.points[i].options[j].direction =
          directions[rangeRNG(0, directions.length - 1)];
        const index = directions.indexOf(m_.points[i].options[j].direction);
        directions.splice(index, 1);
      }
    }
    m_.currentDirections = m_.getCurrentDirections(m_.currentPoint);
    m_.getCurrentForkSrc();
  },
  getCurrentDirections: function (point) {
    return point.options.map((option) => option.direction);
  },
  getCurrentForkSrc: function () {
    let currentFork = "";
    if (m_.currentDirections.length) {
      if (m_.currentDirections.includes("L")) {
        currentFork += "L";
      }
      if (m_.currentDirections.includes("F")) {
        currentFork += "F";
      }
      if (m_.currentDirections.includes("R")) {
        currentFork += "R";
      }
      m_.currentForkSrc =
        m_.currentPath.length > 1
          ? `url("img/forks/${m_.currentDirections.length}/${currentFork}.jpg")`
          : `url("img/forks/START.jpg")`;
    } else {
      m_.win ? (currentFork = "WIN") : (currentFork = "LOSE");
      m_.currentForkSrc = `url("img/forks/${currentFork}.jpg")`;
    }
  },
  getPointTextPosition: function () {
    const pointTexts = document.querySelectorAll(".maze-container__answer");
    for (let i = 0; i < pointTexts.length; i++) {
      pointTexts[i].classList.remove("L", "F", "R");
      for (let j = 0; j < m_.currentPoint.options.length; j++) {
        if (pointTexts[i].textContent === m_.currentPoint.options[j].text) {
          pointTexts[i].classList.add(m_.currentPoint.options[j].direction);
        }
      }
    }
  },
  arrowVisible: true,
  arrowClick: function (direction) {
    if (m_.win || !m_.arrowVisible) {
      return;
    }
    m_.arrowVisible = false;
    if (direction === "B") {
      m_.currentPath.pop();
      m_.currentPoint = m_.currentPath[m_.currentPath.length - 1];
      m_.currentDirections = m_.getCurrentDirections(m_.currentPoint);
      m_.steps++;
    } else {
      m_.currentPath.push(
        m_.currentPoint.options.find((point) => point.direction === direction)
      );
      m_.currentPoint = m_.currentPath[m_.currentPath.length - 1];
      m_.currentDirections = m_.getCurrentDirections(m_.currentPoint);
    }
    m_.moveCharacter(direction);

    if (
      m_.currentPath
        .slice(1)
        .map((point) => point.text)
        .toString() === m_.correctPath.toString()
    ) {
      m_.setWin();
    }
    m_.getCurrentForkSrc();
  },
  moveCharacter: function (direction) {
    const character = document.getElementById("character");
    switch (direction) {
      case "L":
        m_.moveLeft(character);
        break;
      case "F":
        m_.moveForward(character);
        break;
      case "R":
        m_.moveRight(character);
        break;
      case "B":
        m_.moveBack(character);
        break;
    }
  },
  moveLeft: function (character) {
    const backgroundImage = document.querySelector('.maze-container__fork');
    backgroundImage.style.transitionDelay = "2.5s"
    character.style.top = "50%";
    character.style.left = "0";
    character.style.transition = "left 2.5s, top 2.5s, transform 2.5s, background-image 0s";
    character.style.transitionTimingFunction = "linear"
    m_.currentCharSrc =  `url("img/character/L1.png")`
    const step = setInterval(function() {
      (m_.currentCharSrc ===  `url("img/character/L1.png")`) ? m_.currentCharSrc = `url("img/character/L3.png")` : m_.currentCharSrc = `url("img/character/L1.png")`
    }, 150);
    setTimeout(function () {
      m_.moveOnStart(character);
      clearInterval(step)
    }, 2500);
  },
  moveForward: function (character) {
    const backgroundImage = document.querySelector('.maze-container__fork');
    backgroundImage.style.transitionDelay = "2s"
    m_.currentForkSrc === `url("img/forks/START.jpg")` ?  character.style.top = "20%" : character.style.top = "0";
    if (m_.currentForkSrc === `url("img/forks/START.jpg")`){
      m_.timerStart();
    }
    character.style.left = "50%";
    m_.currentCharSrc =  `url("img/character/F1.png")`
    const step = setInterval(function() {
      (m_.currentCharSrc ===  `url("img/character/F1.png")`) ? m_.currentCharSrc = `url("img/character/F3.png")` : m_.currentCharSrc = `url("img/character/F1.png")`
    }, 150);
    setTimeout(function () {
      m_.moveOnStart(character);
      clearInterval(step)
    }, 2000);
  },
  moveRight: function (character) {
    const backgroundImage = document.querySelector('.maze-container__fork');
    backgroundImage.style.transitionDelay = "2.5s"
    character.style.top = "50%";
    character.style.left = "100%";
    character.style.transform = "translate(-100%,0)";
    character.style.transition = "left 2.5s, top 2.5s, transform 2.5s, background-image 0s";

    character.style.transitionTimingFunction = "linear"
    m_.currentCharSrc =  `url("img/character/R1.png")`
    const step = setInterval(function() {
      (m_.currentCharSrc ===  `url("img/character/R1.png")`) ? m_.currentCharSrc = `url("img/character/R3.png")` : m_.currentCharSrc = `url("img/character/R1.png")`
    }, 150);
    setTimeout(function () {
      m_.moveOnStart(character);
      clearInterval(step)
    }, 2500);
  },
  moveBack: function (character) {
    const backgroundImage = document.querySelector('.maze-container__fork');
    backgroundImage.style.transitionDelay = "2s"
    character.style.top = "100%";
    character.style.left = "50%";
    character.style.transform = "translate(0,-100%)";
    m_.currentCharSrc =  `url("img/character/B1.png")`
    const step = setInterval(function() {
      (m_.currentCharSrc ===  `url("img/character/B1.png")`) ? m_.currentCharSrc = `url("img/character/B3.png")` : m_.currentCharSrc = `url("img/character/B1.png")`
    }, 150);
    setTimeout(function () {
      m_.moveOnStart(character);
      clearInterval(step)
    }, 2000);
  },
  moveOnStart: function (character) {
    character.style.transition = "none";
    character.style.top = "100%";
    character.style.left = "50%";
    character.style.transform = "translate(0,-100%)";
    m_.currentCharSrc =  `url("img/character/F1.png")`
    setTimeout(function () {
      character.style.transition = "left 2s, top 2s, transform 2s, background-image 0s";
      character.style.transitionTimingFunction = "linear"
      character.style.top = "50%";
      character.style.left = "50%";
      character.style.transform = "translate(0,0)";
    }, 100);
    const step = setInterval(function() {
      (m_.currentCharSrc ===  `url("img/character/F1.png")`) ? m_.currentCharSrc = `url("img/character/F3.png")` : m_.currentCharSrc = `url("img/character/F1.png")`
    }, 150);
    setTimeout(function () {
      m_.arrowVisible = true;
      m_.currentCharSrc = `url("img/character/F2.png")`
      clearInterval(step)
    }, 2000);

  },
  setWin: function () {
    m_.win = true;
    m_.stopTimer = true;
    m_.timerStart();
  },
  additionalMaterials: [
    {
      content: "Взаимодействие с поставщиками.Переговоры",
      link: "#",
    },
    {
      content: "Антидемпинговые меры",
      link: "#",
    },
    {
      content: "Требования к участникам закупки",
      link: "#",
    },
    {
      content: "Рассмотрение заявки участника предквалификации",
      link: "#",
    },
  ],
  timerValue: 0,
  stopTimer: false,
  showTime: function (time) {
    const minutes =
      time >= 600 ? Math.floor(time / 60) : `0${Math.floor(time / 60)}`;
    const seconds = time % 60 >= 10 ? time % 60 : `0${time % 60}`;
    return `${minutes}:${seconds}`;
  },
  timerStart: function () {
    if (!m_.stopTimer) {
      timerId = setTimeout(() => {
        if (!m_.stopTimer) {
          m_.timerValue++;
        }
        m_.timerStart(m_.stopTimer);
      }, 1000);
    } else {
      clearTimeout(timerId);
    }
  },
  restart: function () {
    m_.win = false;
    m_.timerValue = 0;
    m_.stopTimer = true;
    m_.timerStart();
    m_.steps = 0;

    m_.currentPath.splice(1, m_.currentPath.length);
    m_.currentPoint = m_.currentPath[0];
    m_.setDirections();
    m_.getCurrentForkSrc();
    m_.getPointTextPosition();
  },
};
window.addEventListener("load", () => {
  m_.init();
});
