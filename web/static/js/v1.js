var Fields = {
    cate: ["MPAA Rating", "Source", "Creative Type", "Director", "Distributor", "Major Genre", "Title"],
    date: ["Release Date"],
    trans_quant: ["IMDB Rating", "IMDB Votes", "Production Budget", "Rotten Tomatoes", "Running Time min", "US DVD Sales", "US Gross", "Worldwide Gross"],
    quant: ["COUNT"]
};

var enabled = ["Source", "MPAA Rating", "IMDB Votes", "Production Budget", "Release Date"];

var combinations = ["MPAARating", "MPAARating_Source", "MPAARating_ReleaseDate_Source", "IMDBVotes_MPAARating_ReleaseDate", "MPAARating_ProductionBudget_ReleaseDate",
    "IMDBVotes_MPAARating_ReleaseDate_Source", "MPAARating_ReleaseDate", "IMDBVotes_MPAARating_ProductionBudget_ReleaseDate", "IMDBVotes_MPAARating_ProductionBudget_Source", "IMDBVotes_MPAARating_Source",
    "IMDBVotes_MPAARating_ProductionBudget_ReleaseDate", "IMDBVotes_MPAARating", "IMDBVotes_MPAARating_ProductionBudget", "MPAARating_ProductionBudget", "MPAARating_ProductionBudget_Source",
    "Source", "ReleaseDate_Source", "IMDBVotes_ReleaseDate_Source", "ReleaseDate_ProductionBudget_Source", "IMDBVotes_Source", "IMDBVotes_Source_ProductionBudget",
    "ReleaseDate", "IMDBVotes_ReleaseDate", "IMDBVotes_ProductionBudget_ReleaseDate_Source", "ProductionBudget_ReleaseDate", "IMDBVotes_ProductionBudget_ReleaseDate", "IMDBVotes_ProductionBudget_Source",
    "IMDBVotes", "ProductionBudget", "ProductionBudget_Source", "IMDBVotes_ProductionBudget", "ProductionBudget_ReleaseDate_Source", "MPAARating_ProductionBudget_ReleaseDate_Source"
];

/*var encodings = ["line", "scatter", "dash", "bar", "area"];*/
var fieldLst = document.querySelector(".attr-lst");
var mainImg = document.querySelector(".mainImg");
/* var relatedImg = document.querySelector(".related_main_area");*/
var checkedBoxes = [];

// followings are some disabled teamplates and fiunctions for sidenav fields (ignore for now, fold it if you can)

// <li class="cate-attr">
// <div>
// <i class="fas fa-font"></i> &nbsp;
// <span> ${e} </span>
// <span class="float-right">
//     <i class="fas fa-plus"></i></i>
// </span>
// </div>
// </li>
//  <li class="cate-attr">
//         <div>
//             <i class="fas fa-calendar-alt"></i> &nbsp;
//             <span> ${e} </span>
//             <span class="float-right">
//                 <i class="fas fa-plus"></i></i>
//             </span>
//         </div>
// </li> 
//<li class="trans-quant-attr">
//    <div>
//        <i class="fas fa-caret-down"></i> &nbsp;
//        <i class="fas fa-hashtag"></i> &nbsp;
//        <span> ${e}</span>
//        <span class="float-right">
//            <i class="fas fa-plus"></i>
//        </span>
//    </div>
//</li> 
//<li class="quant-attr">
//    <div>
//        <i class="fas fa-hashtag"></i> &nbsp;
//        <span> COUNT</span>
//        <span class="float-right">
//            <i class="fas fa-plus"></i></i>
//        </span>
//    </div>
//</li> 



// [removed functionalities]. keeped here incase we would reuse some of the functionality


// function addEL() {
//     for (img of document.querySelectorAll(".related_views img")) {
//         img.addEventListener("click", switchEncoding);
//     }
// }

// display related encoding views when clicking [Alternative Encoding] button
// function alternativeEncoding() {
//     let name = mainImg.querySelector("img").className;
//     let res = "";
//     for (e of encodings) {
//         if (e != name) {
//             res += `<img class= '${e}' src="/static/img/version1/${e}_main.png">`;
//         }
//     }
//     relatedImg.innerHTML = res;
//     addEL();
// }

// display related categorical views when clicking [Add Categorical] button
// function addingCategorical() {
//     let name = mainImg.querySelector("img").className;
//     let res = "";
//     for (i of [1, 2, 3]) {
//         res += `<img class= '${name}' src="/static/img/version1/${name+'_categorical_'+i}.png">`;
//     }
//     relatedImg.innerHTML = res;
//     addEL();
// }

// function addingQuantitative() {
//     let name = mainImg.querySelector("img").className;
//     let res = "";
//     for (i of [1, 2, 3]) {
//         res += `<img class= '${name}' src="/static/img/version1/${name+'_quantitative_'+i}.png">`;
//     }
//     relatedImg.innerHTML = res;
//     addEL();
// }

// function switchEncoding(e) {
//     let name = mainImg.querySelector("img").className;
//     if (e.target.src.includes('main')) {
//         let target = e.target.className;
//         let target_src = e.target.src;
//         // swap class of 2 images
//         mainImg.querySelector("img").className = target;
//         e.target.className = name;
//         //swap srcs
//         e.target.src = mainImg.querySelector("img").src;
//         mainImg.querySelector("img").src = target_src;
//         addEL();
//     }

// }


// initField(Fields);
// alternativeEncoding();
// addEL();

// document.querySelector(".AE").addEventListener("click", alternativeEncoding);

// document.querySelector(".AC").addEventListener("click", addingCategorical);

// document.querySelector(".AQ").addEventListener("click", addingQuantitative);

/* a helper function that put all attrbutes to field list on sidenav.*/
function addFields(fields) {
    let res = "";
    let disabledstr = "disabled";
    let enabledstr = "";
    for (e of fields.cate) {
        if (enabled.includes(e)) {
            disabledstr = "";
            enabledstr = "enabled";
        }
        res += `<li class="cate-attr ${enabledstr} ${disabledstr}">
                    <div>
                        <i class="fas fa-font"></i> &nbsp;
                        <label class="form-check-label" for="${e}">
                           ${e}
                        </label>
                        <span class="check float-right">
                            <input class="form-check-input" type="checkbox" value="${e}" id="${e}" ${disabledstr}/>
                        </span>
                    </div>
                </li>`;
        disabledstr = "disabled";
        enabledstr = "";
    }
    for (e of fields.date) {
        if (enabled.includes(e)) {
            disabledstr = "";
            enabledstr = "enabled";
        }
        res += `<li class="cate-attr ${enabledstr} ${disabledstr}">
                    <div>
                        <i class="fas fa-calendar-alt"></i> &nbsp;
                        <label class="form-check-label" for="${e}"> ${e} </label>
                        <span class="check float-right">
                            <input class="form-check-input" type="checkbox" value="${e}" id="${e}" ${disabledstr} />
                        </span>
                    </div>
                </li>`;
        disabledstr = "disabled";
        enabledstr = "";
    }
    for (e of fields.trans_quant) {
        if (enabled.includes(e)) {
            disabledstr = "";
            enabledstr = "enabled";
        }
        res += `<li class="trans-quant-attr ${enabledstr} ${disabledstr}">
                    <div>
                        <i class="fas fa-caret-down"></i> &nbsp;
                        <i class="fas fa-hashtag"></i> &nbsp;
                        <label class="form-check-label" for="${e}"> ${e} </label>
                        <span class="check float-right">
                            <input class="form-check-input" type="checkbox" value="${e}" id="${e}" ${disabledstr} />
                        </span>
                    </div>
                </li>`;
        disabledstr = "disabled";
        enabledstr = "";
    }
    for (e of fields.quant) {
        if (enabled.includes(e)) {
            disabledstr = "";
            enabledstr = "enabled";
        }
        res += `<li class="quant-attr ${enabledstr} ${disabledstr}">
                    <div>
                        <i class="fas fa-hashtag"></i> &nbsp;
                        <label class="form-check-label" for="${e}"> ${e} </label>
                        <span class="check float-right">
                            <input class="form-check-input" type="checkbox" value="${e}" id="${e}" ${disabledstr} />
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

    //adding event listeners to field labels
    let a = document.querySelectorAll("form .enabled div");
    for (i of a) {
        // whenever a box is clicked, update the box to checked,
        //  and call readFields() to update plots
        i.addEventListener("click", (e) => {
            let box = e.target.querySelector("input");
            if (box != null) box.checked = !box.checked;
            readFields();
        })
    }
};

// this function is called by submitting the selected fields on the sidenav
function readFields() {
    let allCheckboxes = document.querySelectorAll("form .enabled input");
    let checkedValues = [];
    let selectedBoxes = [];
    let i = 0;

    // collect selected fields
    for (box of allCheckboxes) {
        if (box.checked) {
            selectedBoxes[i] = box;
            checkedValues[i] = box.value.split(" ").join('');
            i++;
        }
    }
    // if nothing is checked, display the message.
    if (checkedValues.length == 0) {
        mainImg.innerHTML = `Welcome! Please select fields to generate recommanded charts.`;
        return false;
    }
    checkedValues.sort();
    // generate chart
    let str = checkedValues.join("_");
    if (combinations.includes(str)) {
        mainImg.innerHTML = `<img src="/img/version1/${str}.png" >`;
        // save the changes if we succeed
        checkedBoxes = selectedBoxes;
    } else {
        // if the selection is not applicable, revert selections to previous one.
        alert(`Can not generate chart with such fields, unavailable selections has been reverted.`);
        revertSelections(checkedBoxes);
    }

    return false;
}

// helper function that revert the selection of fields
function revertSelections(checkedBoxes) {
    let allCheckboxes = document.querySelectorAll("form .enabled input");
    for (box of allCheckboxes) {
        if (checkedBoxes.includes(box)) box.checked = true;
        else box.checked = false;
    }
}

initField(Fields);