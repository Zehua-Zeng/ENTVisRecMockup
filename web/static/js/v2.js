var graphMap = {
    "graph1": ["point", "tick", "bar"],
    "graph2": ["point", "tick", "bar", "line", "area"],
    "graph3": ["point", "tick", "bar", "line", "area"]
}
var mainImg = document.querySelector(".specified_main_area");
var msg = document.querySelector(".msg");
var relatedImg = document.querySelector(".related_main_area");

// this function init main page (display recommanded views and)
function init() {
    // hide the alt view and display the inital view
    document.querySelector(".alt_page_content").style.display = "none";
    document.querySelector(".page_content").style.display = "initial";

    // document.querySelector(".alt_page_content").style.display = "initial";
    // document.querySelector(".page_content").style.display = "hide";
    relatedImg.innerHTML = `<img class="bar rec" id="graph1" src="/img/graph1_bar_main_1.png">
                            <img class="bar rec" id="graph2" src="/img/graph2_bar_main_1.png">
                            <img class="line rec"  id="graph3" src="/img/graph3_line_main_1.png">`;
    msg.innerHTML = `No specified visualization yet. Start exploring by dragging a field to encoding pane on the left or
    examining univariate summaries below.`;

    addEL();
}

function addEL() {
    Array.prototype.forEach.call(document.querySelectorAll(".rec"), function (item) {
        item.addEventListener("click", specified);
    });
}

function specified(e) {
    let target = e.target;
    let encoding = target.classList[0],
        src = e.target.src,
        id = e.target.id;
    // hide original view and display the alternative one
    document.querySelector(".page_content").style.display = "none";
    document.querySelector(".alt_page_content").style.display = "initial"

    // render the specified views
    renderSpecified(encoding, src, id);
    // add event listener to back button
    document.querySelector(".return").addEventListener("click", () => init());
    // TODO: add event listener to alternative encoding buttons


    // render the related views
    renderRelated(encoding, id);


}

// helper function that renders the specified views when page is loaded.
function renderSpecified(cls, src, id) {
    // add correct specified image by class
    document.querySelector("#specified").innerHTML = `<img class="${cls}" src="${src}" width=100% height=100%>`;
    // add corresponding buttons    
    let btns = `<h5>Alternative Encodings</h5>`;
    for (e of graphMap[id]) {
        btns += `<button class="btn btn-light " id="${e}">${e}</button>`;
    }
    document.querySelector("#buttons").innerHTML = btns;

    // add event listener to alternative encoding buttons
    for (e of document.querySelectorAll("#buttons button")) {
        e.addEventListener("click", (e) => renderRelated(e.target.id, id));
    }
}

// helper function that renders the related views when page is loaded.
function renderRelated(id, graph) {
    document.querySelector("#specified").innerHTML = `<img class="${id}" src="/img/${graph}_${id}_main.png" width=100% height=100%>`;
    document.querySelector("#cate_img").innerHTML = `<img src="/img/${graph}_${id}_category.png" width="100%">`;
    document.querySelector("#quant_img").innerHTML = `<img src="/img/${graph}_${id}_quant.png" width="100%">`;
}

init();

// document.querySelector(".page_content").style.display = "none";