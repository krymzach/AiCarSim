document.getElementById('genCount').innerText = localStorage.getItem('genCount') ? "Generation: " + String(localStorage.getItem('genCount')) : "Generation: 1";

const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 1000;

const carCtx = carCanvas.getContext("2d");
networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
let laneCenters = [];
for (let i = 0; i < road.laneCount; i++) {
    laneCenters.push(road.getLaneCenter(i));
}

const N = 10;
document.getElementById('carCount').innerText = "Cars: " + N;
const cars = generateCars(N);
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain")
        );
        if(i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(Math.round(Math.random() * 2)), -Math.round(Math.random() * 1000), 30, 50 + Math.round(Math.random() * 50), "DUMMY", 1 + Math.round(Math.random() * 2), "red"),
    new Car(road.getLaneCenter(Math.round(Math.random() * 2)), -Math.round(Math.random() * 1000), 30, 50 + Math.round(Math.random() * 50), "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(Math.round(Math.random() * 2)), -Math.round(Math.random() * 1000), 30, 50 + Math.round(Math.random() * 50), "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(Math.round(Math.random() * 2)), -Math.round(Math.random() * 1000), 30, 50 + Math.round(Math.random() * 50), "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(Math.round(Math.random() * 2)), -Math.round(Math.random() * 1000), 30, 50 + Math.round(Math.random() * 50), "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(Math.round(Math.random() * 2)), -Math.round(Math.random() * 1000), 30, 50 + Math.round(Math.random() * 50), "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(Math.round(Math.random() * 2)), -Math.round(Math.random() * 1000), 30, 50 + Math.round(Math.random() * 50), "DUMMY", 2, "red")
];

animate();

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
    localStorage.setItem("genCount", localStorage.getItem("genCount") ? localStorage.getItem("genCount") + 1 : 2);
}

function discard() {
    localStorage.removeItem("bestBrain");
    localStorage.setItem("genCount", 1);
    location.reload();
}

function generateCars(N) {
    const cars = [];
    for(let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function findBestCar() {
    let bestFitness;
    let bestCar;
    for (let i = 0; i < cars.length; i++) {
        let fitness = cars[i].y / ((road.width - 20) / (road.laneCount + 1) - (cars[i].laneCenterDistance + 500));
        if((!bestFitness || bestFitness < fitness) && cars[i].x != road.getLaneCenter(1) && Math.abs(cars[i].angle) < Math.PI / 2) {
            bestFitness = fitness;
            bestCar = cars[i];
        }
    }
    if(bestCar) {
        return bestCar;
    } else {
        return cars[0];
    }
}

function animate(time) {
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, [], [], road.laneLines);
    }
    
    for(let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic, laneCenters, road.laneLines);
    }


    bestCar = findBestCar();

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);
    road.draw(carCtx);
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha = 0.2;
    for(let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}

setTimeout(() => {
    save();
    location.reload();
}, 75000);