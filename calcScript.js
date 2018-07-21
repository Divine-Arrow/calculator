var calculationController = (function () {

    var data = {
        currentNumber: 0,
        previousNumber: 0,
        result: 0,
        operator: 0,
        times: 0
    };

    var reset = function () {
        data.currentNumber = 0;
        data.previousNumber = 0;
        data.result = 0;
        data.operator = 0;
    };

    var spliter = function (num) {
        var y, newNum;
        num = num + "";
        y = num.split(".");
        newNum = y[0] + "." + y[1].slice(0, 2);;
        return parseFloat(newNum)
    }

    return {
        addItem: function (temp) {
            var indexo = data.currentNumber + "";
            if (temp === "." && indexo.indexOf(".") === -1) {
                data.currentNumber = data.currentNumber + ".";
            } else if (temp !== ".") {
                data.currentNumber = parseFloat(data.currentNumber + "" + temp);
            }
        },

        shift: function (shiftResult) {
            if (shiftResult) {
                data.currentNumber = data.result;
            } else {
                data.previousNumber = data.currentNumber;
                data.currentNumber = 0;
            }
        },

        lastBack: function () {

            // slice method
            var temp = data.currentNumber + "";
            var y = Number(temp.slice(0, temp.length - 1));
            data.currentNumber = y;

        },

        saveKey: function (operator) {
            data.operator = operator;
        },

        execution: function () {
            var resultSaver;
            switch (data.operator) {
                case "/":
                    resultSaver = data.previousNumber / data.currentNumber;
                    break;
                case "*":
                    resultSaver = data.previousNumber * data.currentNumber;
                    break;
                case "-":
                    resultSaver = data.previousNumber - data.currentNumber;
                    break;
                case "+":
                    resultSaver = data.previousNumber + data.currentNumber;
                    break;
                case "%":
                    resultSaver = data.currentNumber / 100;
                    if (resultSaver % 1 === 0) {
                        data.previousNumber = resultSaver;
                    } else {
                        data.previousNumber = spliter(resultSaver);
                    }
                    break;
            }


            if (resultSaver % 1 === 0) {
                data.result = resultSaver;
            } else {
                data.result = spliter(resultSaver);
            }
        },

        resetData: function () {
            reset();
        },

        manyTimes: function (zer) {
            if (zer) {
                data.times = 0;
            } else {
                data.times++
            }
        },

        getData: function () {
            return {
                currNum: data.currentNumber,
                preNum: data.previousNumber,
                result: data.result,
                operator: data.operator,
                times: data.times
            }
        }
    }
})();

var UIController = (function () {

    var DOMStrings = {
        left: ".top p",
        right: ".right",
        cells: ".bottom td",
        bottom: ".bottom"
    };

    var UiKeys = function (key) {
        var keys = document.querySelectorAll(DOMStrings.cells);

        var allKeys = ["AC", "Delete", "/", "*", "7", "8", "9", "-", "4", "5", "6", "+", "1", "2", "3", "Enter", "%", "0", "."];

        allKeys.forEach(function (el, index) {
            if (el === key) {
                keys[index].classList.toggle("anim");
            }
        });
    };

    return {
        uiKey: function (elem) {

            var keyCode, key, arr;

            keyCode = ["none", "none", "47", "42", "55", "56", "57", "45", "52", "53", "54", "43", "49", "50", "51", 13, "37", "0", "46"];

            key = ["none", "Backspace", "/", "*", "7", "8", "9", "-", "4", "5", "6", "+", "1", "2", "3", "Enter", "%", "0", "."];

            var allTd = document.querySelectorAll(DOMStrings.cells);

            allTd.forEach(function (el, ind) {
                if (el === elem) {
                    arr = [key[ind], keyCode[ind], ind];
                }
            });

            return arr;
        },
        addLeft: function (item) {
            // left
            document.querySelector(DOMStrings.left).textContent = item;
        },

        addRight: function (item, newLi) {
            // right
            var li, html;
            li = document.querySelector(DOMStrings.right);
            if (newLi) {

                html = "<li>%value%</li>";
                newHtml = html.replace("%value%", item);
                li.insertAdjacentHTML("beforeend", newHtml);
            } else {
                document.querySelectorAll(DOMStrings.right + " li")[document.querySelectorAll(DOMStrings.right + " li").length - 1].textContent = item;
            }
        },

        colorEqual: function () {
            document.querySelectorAll(DOMStrings.right + " li")[document.querySelectorAll(DOMStrings.right + " li").length - 1].style.color = "#73fa7d";
        },

        keyAnimation: function (key, shift, ctrl) {
            if ((key === "Backspace" && shift) || (key === "Backspace" && ctrl)) {
                UiKeys("AC");
            } else if (key === "Backspace" && !shift) {
                UiKeys("Delete");
            } else {
                UiKeys(key);
            }
        },
        resetUI: function () {
            document.querySelector(DOMStrings.left).textContent = 0;
            var keys = document.querySelectorAll(DOMStrings.right + " li");
            keys.forEach(function (el) {
                el.parentNode.removeChild(el);
            });
        },
        getDom: function () {
            return DOMStrings;
        }
    }
})();

var controller = (function (calCtrl, UICtrl) {
    var bool = {
        newLi: false,

        // run variable isto not add unnecessarily execution 
        run: false,
        runNum: true,
        isOperatorClicked: true,

        // to fix looping operator shifting shift(false) or shift(true)
        isOperatorLoop: false,

        // only execute when operator and operand both are inserted 
        isLoopExecution: false
    }


    var setupEventListener = function () {

        DOM = UICtrl.getDom();

        // event listener for the all Keys
        document.addEventListener("keypress", keys);
        // keydown because plus and other operator is not working
        document.addEventListener("keydown", keyAnim);
        document.addEventListener("keyup", keyAnim);
        // ui input
        document.querySelector(DOM.bottom).addEventListener("click", uiInp);

    }

    var keys = function (e) {
        // for numbers 1 to 9
        numbers(e.key);

        // this is for the operators key = /,*,-,+,%   only 5
        operators(e.keyCode, e.key);

        // now the execution part
        enters(e.keyCode);
    };

    var keyAnim = function (e) {

        UICtrl.keyAnimation(e.key, e.shiftKey, e.ctrlKey);

        if ((e.key === "Backspace" && e.shiftKey) || (e.key === "Backspace" && e.ctrlKey)) {
            resetAll();
        };

        if (e.type === "keydown" && e.key === "Backspace") {
            calCtrl.lastBack();
            backData = calCtrl.getData();
            UICtrl.addLeft(backData.currNum);
            UICtrl.addRight(backData.currNum, false);
        }
    };

    var uiInp = function (e) {
        var tempo;

        tempo = UICtrl.uiKey(e.target);

        // tempo[0] = key; tempo[1] =  keyCode; tempo[2]= index  

        numbers(tempo[0]);
        operators(tempo[1], tempo[0]);
        enters(tempo[1]);

        // For AC
        if (tempo[2] === 0) {
            UICtrl.keyAnimation(tempo[0], true);
            resetAll();
        }
        // for Backspace
        if (tempo[2] === 1) {
            UICtrl.keyAnimation(tempo[0], false);
            UICtrl.keyAnimation(tempo[0], false);
            calCtrl.lastBack();
            backData = calCtrl.getData();
            UICtrl.addLeft(backData.currNum);
            UICtrl.addRight(backData.currNum, false);
        }
    };

    // event functions

    var numbers = function (key) {
        if (key >= 0 && key <= 9 || key === ".") {
            if (bool.runNum) {
                calCtrl.addItem(key);
                data = calCtrl.getData();
                UICtrl.addLeft(data.currNum);
                UICtrl.addRight(data.currNum, bool.newLi);
                bool.newLi = false;
                bool.isOperatorClicked = true;
                bool.isOperatorLoop = false;
                bool.isLoopExecution = true;
            }
        }
    };

    var operators = function (keyCode, key) {
        if (keyCode >= 42 && keyCode <= 47 && keyCode !== 44 && keyCode !== 46 && key !== "." || keyCode === 37) {

            if (keyCode === 37) {
                calCtrl.saveKey(key);
                calCtrl.execution();
                bool.newLi = true;
                data = calCtrl.getData();
                UICtrl.addRight("/", bool.newLi);
                UICtrl.addRight("100", bool.newLi);
                UICtrl.addRight("=", bool.newLi);
                UICtrl.colorEqual();
                UICtrl.addLeft(data.result);
                UICtrl.addRight(data.result, bool.newLi);
                UICtrl.colorEqual();
                calCtrl.shift(true);
            } else {
                calCtrl.manyTimes(false);
                temp = calCtrl.getData();
                if (temp.times > 1) {
                    calCtrl.execution();
                    calCtrl.shift(true);
                }

                //  1. Add key pressed in datastructure
                calCtrl.saveKey(key);
                data = calCtrl.getData();
                //  2. Add
                // checking for repeat
                if (bool.isOperatorClicked) {
                    bool.newLi = true;
                    bool.isOperatorClicked = false;
                } else {
                    bool.newLi = false;
                }
                UICtrl.addRight(data.operator, bool.newLi);
                bool.newLi = true;
                //  3. transfer current to prev
                if (!bool.isOperatorLoop) {
                    calCtrl.shift(false); // shift(false) means the previous data is equal to current data
                    bool.isOperatorLoop = true;
                }
                bool.run = true;
                bool.runNum = true;
            }

            bool.isLoopExecution = false;

        }
    };

    var enters = function (keyCode) {
        if (keyCode === 13) {
            if (bool.run && bool.isLoopExecution) {
                calCtrl.manyTimes(true);
                calCtrl.execution();
                // update in UI
                // 1. Add newLi of key
                bool.newLi = true;
                data = calCtrl.getData();
                UICtrl.addRight("=", bool.newLi);
                UICtrl.colorEqual();
                UICtrl.addLeft(data.result);
                UICtrl.addRight(data.result, bool.newLi);
                UICtrl.colorEqual();
                calCtrl.shift(true);
                bool.run = false;
                bool.runNum = false;
                bool.isOperatorClicked = true;
                bool.isOperatorLoop = false;
                bool.isLoopExecution = false;
            }
        }
    };

    var resetAll = function () {
        calCtrl.resetData();
        UICtrl.resetUI();

        // create one li of zero
        UICtrl.addRight(0, true);

        // default boolean values
        bool.newLi = false;
        bool.run = false;
        bool.runNum = true;
        bool.isOperatorClicked = true;
        bool.isOperatorLoop = false;
        bool.isLoopExecution = false;
    };

    return {
        init: function () {
            console.log("Application has been stated");
            setupEventListener();
            resetAll();
        }
    }
})(calculationController, UIController);

controller.init();



// work on UIController.Uikeys and UICOntroller.keyanimation    to make a animation wheen user going to hit a key on the keyboard... ================ Done ==============
//control the shift key unwanted events  remove unwanted events

// remember to fix the operation of more than 2 number1
// fix result   it shold be 2 number after decimal  *** Todo ***  number % 1 = 0 then no decimal else decimal  *** working on====
// work on the misscalculation with multiply