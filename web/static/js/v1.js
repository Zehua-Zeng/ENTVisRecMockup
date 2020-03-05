var Fields = {
    cate: ["Creative Type", "Director", "Distributor", "Major Genre", "MPAA Rating", "Source", "Title"],
    date: ["Release Date"],
    trans_quant: ["IMDB Rating", "IMDB Votes", "Production Budget", "Rotten Tomatoes", "Running Time min", "US DVD Sales", "US Gross", "Worldwide Gross"],
    quant: ["COUNT"]
};

var encodings = ["line", "scatter", "dash", "bar", "area"];
var fieldLst = document.querySelector(".attr-lst");
var mainImg = document.querySelector(".mainImg");
var relatedImg = document.querySelector(".related_main_area");

// a helper function that put all attrbutes to field list on sidenav.
function addFields(fields) {
    let res = "";
    for (e of fields.cate) {
        res += `<li class="cate-attr">
                <div>
                    <i class="fas fa-font"></i> &nbsp;
                    <span> ${e} </span>
                    <span class="float-right">
                        <i class="fas fa-plus"></i></i>
                    </span>
                </div>
            </li>`;
    }
    for (e of fields.date) {
        res += `<li class="cate-attr">
                <div>
                    <i class="fas fa-calendar-alt"></i> &nbsp;
                    <span> ${e} </span>
                    <span class="float-right">
                        <i class="fas fa-plus"></i></i>
                    </span>
                </div>
            </li>`;
    }
    for (e of fields.trans_quant) {
        res += `<li class="trans-quant-attr">
                <div>
                    <i class="fas fa-caret-down"></i> &nbsp;
                    <i class="fas fa-hashtag"></i> &nbsp;
                    <span> ${e}</span>
                    <span class="float-right">
                        <i class="fas fa-plus"></i></i>
                    </span>
                </div>
            </li>`;
    }
    for (e of fields.quant) {
        res += `<li class="quant-attr">
                <div>
                    <i class="fas fa-hashtag"></i> &nbsp;
                    <span> COUNT</span>
                    <span class="float-right">
                        <i class="fas fa-plus"></i></i>
                    </span>
                </div>
            </li>`;
    }
    fieldLst.innerHTML += res;
}

// does what it said.. it init the field list on sidenav.
function initField(fields) {
    fieldLst.innerHTML = '';
    addFields(fields);
};

// [TODO] need to fix dynamic coding, so do not use this helper func any more.
//  this function add event listener to all images of [Related views] 
// currently I am using this when updating new images to [Related views].
function addEL() {
    for (img of document.querySelectorAll(".related_views img")) {
        img.addEventListener("click", switchEncoding);
    }
}

// display related encoding views when clicking [Alternative Encoding] button
function alternativeEncoding() {
    let name = mainImg.querySelector("img").className;
    let res = "";
    for (e of encodings) {
        if (e != name) {
            res += `<img class= '${e}' src="/static/img/${e}_main.png">`;
        }
    }
    relatedImg.innerHTML = res;
    addEL();
}

// display related categorical views when clicking [Add Categorical] button
function addingCategorical() {
    let name = mainImg.querySelector("img").className;
    let res = "";
    for (i of [1, 2, 3]) {
        res += `<img class= '${name}' src="/static/img/${name+'_categorical_'+i}.png">`;
    }
    relatedImg.innerHTML = res;
    addEL();
}

function addingQuantitative() {
    let name = mainImg.querySelector("img").className;
    let res = "";
    for (i of [1, 2, 3]) {
        res += `<img class= '${name}' src="/static/img/${name+'_quantitative_'+i}.png">`;
    }
    relatedImg.innerHTML = res;
    addEL();
}

function switchEncoding(e) {
    let name = mainImg.querySelector("img").className;
    if (e.target.src.includes('main')) {
        let target = e.target.className;
        let target_src = e.target.src;
        // swap class of 2 images
        mainImg.querySelector("img").className = target;
        e.target.className = name;
        //swap srcs
        e.target.src = mainImg.querySelector("img").src;
        mainImg.querySelector("img").src = target_src;
        addEL();
    }

}


initField(Fields);
alternativeEncoding();
addEL();

document.querySelector(".AE").addEventListener("click", alternativeEncoding);

document.querySelector(".AC").addEventListener("click", addingCategorical);

document.querySelector(".AQ").addEventListener("click", addingQuantitative);