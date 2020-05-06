var cql = require("compassql");

// use this variable for generating sidebar(can be omitted by using [var types] instead, but not fixed yet)
var Fields = {
    cate: [
        "MPAA_Rating",
        "Source",
        "Creative_Type",
        "Director",
        "Distributor",
        "Major_Genre",
        "Title",
    ],
    date: ["Release_Date"],
    trans_quant: [
        "IMDB_Rating",
        "IMDB_Votes",
        "Production_Budget",
        "Rotten_Tomatoes",
        "Running_Time_min",
        "US_DVD_Sales",
        "US_Gross",
        "Worldwide_Gross",
    ],
};

var recFields = [
    ["Creative_Type", "US_DVD_Sales"],
    ["Major_Genre", "US_Gross"],
    ["Creative_Type", "Major_Genre"],
    ["Rotten_Tomatoes_Rating", 'IMDB_Rating'],
    ["Production_Budget", "Release_Date"],
    ["Creative_Type", "IMDB_Rating"]
];

var graphMap = {
    "graph1": ["point", "tick", "bar"],
    "graph2": ["point", "tick", "bar", "line", "area"],
    "graph3": ["point", "tick", "bar", "line", "area"]
}

// this var records types of each fields, count as a helper for compassQL 
var types = {
    MPAA_Rating: "ordinal",
    Source: "nominal",
    Creative_Type: "nominal",
    Director: "nominal",
    Distributor: "nominal",
    Major_Genre: "nominal",
    Title: "nominal",
    Release_Date: "temporal",
    IMDB_Rating: "quantitative",
    IMDB_Votes: "quantitative",
    Production_Budget: "quantitative",
    Rotten_Tomatoes_Rating: "quantitative",
    Running_Time_min: "quantitative",
    US_DVD_Sales: "quantitative",
    US_Gross: "quantitative",
    Worldwide_Gross: "quantitative",
    // COUNT: "quantitative",
};
// this var records types of marks that can exist as a mark in CompassQL
var markTypes = [
    "area",
    "bar",
    "circle",
    "line",
    "point",
    // "rect",
    // "rule",
    "square",
    // "text",
    "tick",
    // "geoshape",
];

// ====== vars related to compassQL =======
var opt = {};
var myschema = null;
var myData = null;

// ========== other vars ==============
var dataurl = "data/movies.json";
var bookmarkContent = document.querySelector(".bookmark_content");
var queryMap = {}; // this map tracks the query for different plots, keys are ids of inner div.
var mainImg = document.querySelector(".specified_main_area");
var msg = document.querySelector(".msg");
var recArea = document.querySelector(".recommandation_main_area");


// hide the alt view and display the inital view
document.querySelector(".alt_page_content").style.display = "none";
document.querySelector(".page_content").style.display = "initial";
// after we fetched the data, assign schema for compassQL recommandation generation,
// and initialize the page with initial content.
d3.json(dataurl).then(assignSchema);

/**
 *  does what is says, assign schema for CompassQL recommandation generation, and call init() to init the main page.
 */
function assignSchema(data) {
    myData = data;
    myschema = cql.schema.build(data, opt);
    init();
    let modal = document.querySelector("#popup");
    let btn = document.querySelector("#bookmark");
    let closeBtn = document.querySelector(".close");

    // When the user clicks on the [Bookmarks] button, toggle the modal
    btn.addEventListener("click", () => {
        if (modal.style.display == "block") {
            modal.style.display = "none";
        } else {
            // when the window is displayed, plot charts in divs
            modal.style.display = "block";
            refreshBookmark();
        }
    });

    // When the user clicks on <span> (x), close the modal
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}

// this function init main page (display recommanded views and)
function init() {
    recArea.innerHTML = "";
    // hide alt view every tiome back to main page.
    document.querySelector(".alt_page_content").style.display = "none";
    document.querySelector(".page_content").style.display = "initial";
    let i = 0;
    for (arr of recFields) {
        plotRecommandations(arr, i++);
    }

    // change color and state of a bookmark if a wrapper is in the bookmark content.
    let wrappers = document.querySelectorAll(".view_wrapper");
    for (wrapper of wrappers) {
        let item = `v4_${wrapper.classList.item(1).split("_wrapper")[0]}`;
        if (
            window.localStorage.getItem(item) != null &&
            window.localStorage.getItem(item) != undefined
        ) {
            wrapper.querySelector("i").style.color = "#60608A";
            wrapper.querySelector("i").setAttribute("added", "true");
        }
    }

    // add event listeners to all bookmark buttons on the page.
    let btns = document.querySelectorAll(".add_bm");
    for (btn of btns) {
        btn.addEventListener("click", toggleBookMark);
    }

    // add event listieners to all explore buttons on the page.
    let expbtns = document.querySelectorAll(".explore");
    for (btn of expbtns) {
        btn.addEventListener("click", exploreRecommandation);
    }
}

// This function plot recommandatoins on the main page.
function plotRecommandations(arr, i) {
    let query = generateRecommandation(arr, null);
    let queryClassName = JSON.stringify(query).replace(/\W/g, "");
    recArea.innerHTML += `
        <div class='view_wrapper ${queryClassName}_wrapper'>
            <i class='fas fa-bookmark add_bm' added="false"></i>
            <span class="explore" value="${i}"> explore </span>
            <div class="views cate" id='${queryClassName}'></div>
        </div>`;
    queryMap[queryClassName] = query;
    plotRec(queryClassName, query);
}

/**
 *  This is event function of bookmark buttons on visualizations
 */
function toggleBookMark(e) {
    let btn = e.target;
    let vis = e.target.parentElement;
    let str = vis.classList.item(1);

    // if the mark was checked, user want to uncheck it.
    if (btn.getAttribute("added") == "true") {
        // remove bookmark from pop up window
        let arr = bookmarkContent.childNodes;
        for (n of arr) {
            if (
                `${str}`
                .split("_wrapper")[0]
                .split("_bm")[0]
                .localeCompare(n.classList.item(1).split("_bm")[0]) == 0
            ) {
                bookmarkContent.removeChild(n);
            }
        }
        window.localStorage.removeItem(`v4_${str.split("_wrapper")[0]}`);

        // change color and state of the plot in views
        let mark = document.querySelector(`.${str.split("_bm")[0]} i`);
        if (mark != null) {
            mark.style.color = "rgb(216, 212, 223)";
            mark.setAttribute("added", "false");
        }
        refreshBookmark();

        // if the mark is unchecked, user want to check it.
    } else {
        btn.style.color = "#60608A";
        btn.setAttribute("added", "true");

        let splittedStr = str.split("_wrapper")[0];

        // if there is currently no charts, empty its inner html.
        if (window.localStorage.length == 0) {
            bookmarkContent.innerHTML = "";
        }

        // tracks query for the bookmark in local storage.
        window.localStorage.setItem(`v4_${splittedStr}`, JSON.stringify(queryMap[splittedStr]));
    }
}

/**
 *  This function runs everytime a bookmark is popped up.
 *   It plots visualizations for each v4 bookmarks in localStorage.
 */
function refreshBookmark() {
    let v4keys = []; // array that contains all keys in localStorage that belongs to v4
    let btnstrs = []; // array that contain all newly generated bookmark buttons inside modal

    // put all keys in local storage that belongs to v4 into the array v4keys 
    for (var i = 0; i < window.localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith("v4_")) v4keys.push(key);
    }

    // if there are no bookmarks, display a message
    if (v4keys.length == 0) {
        bookmarkContent.innerHTML =
            "Oops, you don't have any bookmark yet. Click on bookmark tags on charts to add a bookmark!";
    } else { // otherwise, plot all bookmarks
        bookmarkContent.innerHTML = "";
        for (key of v4keys) {
            let k = key.substring(3);
            let value = window.localStorage.getItem(key);

            // create div structure (a div wrapper, bookmark button and a innerdiv) append to the popup window.
            bookmarkContent.innerHTML += `<div class="view_wrapper ${k}_wrapper_bm" ><i class="fas fa-bookmark add_bm" added="true"></i><div class="views cate" id="${k}_bm"></div></div>`;

            // get query specification according to local storage
            let myVlSpec = JSON.parse(value);

            // plot the recommandation
            plotRec(`${k}_bm`, myVlSpec);

            // add the class name of newly added button to btnstrs
            btnstrs.push(`.${k}_wrapper_bm i`);

            // change color and attribute of bookmark.
            let btn = document.querySelector(`.${k}_wrapper_bm i`);
            btn.style.color = "#60608A";
            btn.setAttribute("added", "true");
        }
        // add event listener to new bookmark
        // [Why not add eventlistener inside for loop?]: 
        // It cause the problem that the event listenter is only added to the last bookmark button in the modal.
        for (btn of btnstrs)
            document.querySelector(btn).addEventListener("click", toggleBookMark);
    }
}

// This function is the event of explore buttons of visualizations (main page).
function exploreRecommandation(e) {

    let target = e.target;
    let index = target.getAttribute("value");
    let arr = recFields[index];

    recArea.innerHTML = '';

    // hide original view and display the alternative one
    document.querySelector(".page_content").style.display = "none";
    document.querySelector(".alt_page_content").style.display = "initial";

    // generate query and class name for that recommandation
    let query = generateRecommandation(arr, null);
    let queryClassName = JSON.stringify(query).replace(/\W/g, "");

    // render specified section of alternative view
    document.querySelector("#specified").innerHTML = `
    <div class='view_wrapper ${queryClassName}_wrapper'>
        <i class='fas fa-bookmark add_bm' added="false"></i>
        <div class="views cate" id='${queryClassName}'></div>
    </div>`;

    // plot the query
    plotRec(queryClassName, query);

    // add event listener to the backToHomePage button
    document.querySelector(".return").addEventListener("click", () => init());

    // generate alternative encodings for the recommandations
    generateAlternatveEncodings(query, arr);

    // generate categorical & quatitative recommandations
    generateFieldRec(arr);


    // change color and state of a bookmark if a wrapper is in the bookmark content.
    let wrappers = document.querySelectorAll(".view_wrapper");
    for (wrapper of wrappers) {
        let item = `v4_${wrapper.classList.item(1).split("_wrapper")[0]}`;
        if (
            window.localStorage.getItem(item) != null &&
            window.localStorage.getItem(item) != undefined
        ) {
            wrapper.querySelector("i").style.color = "#60608A";
            wrapper.querySelector("i").setAttribute("added", "true");
        }
    }

    // add event listeners to all bookmark buttons on the page.
    let btns = document.querySelectorAll(".add_bm");
    for (btn of btns) {
        btn.addEventListener("click", toggleBookMark);
    }

}


/**
 * This function gnerate alternative encodings of specific view.
 */
function generateAlternatveEncodings(spec, arr) {
    let fieldTypes = toFieldTypes(arr);
    let specmark = spec.mark;
    document.querySelector(`.alternative_encodings`).innerHTML = "";
    for (m of markTypes) {
        if (0 != m.localeCompare(specmark)) {
            let query = JSON.parse(JSON.stringify(spec));
            query.mark = m;
            // plotALternativeEncoding(query, fieldTypes);
            if (fieldTypes.length == 1) {
                if (m.localeCompare("area") != 0 && m.localeCompare("line") != 0) plotALternativeEncoding(query);
            } else if (fieldTypes.length == 2) {
                if (fieldTypes.includes("nominal") || fieldTypes.includes("ordinal")) {
                    if (m.localeCompare("line") != 0 && m.localeCompare("area") != 0 && m.localeCompare("bar") != 0) plotALternativeEncoding(query);
                } else {
                    plotALternativeEncoding(query);
                }
            } else {
                let countCate = 0;
                for (e of fieldTypes) {
                    if (e.localeCompare("ordinal") == 0 || e.localeCompare("nominal") == 0) countCate++;
                }
                if (countCate >= 2 && m.localeCompare("area") != 0 && m.localeCompare("line") != 0)
                    plotALternativeEncoding(query);
                if (countCate < 2)
                    plotALternativeEncoding(query);
            }
        }
    }
}

/**
 *  This function create an array of field types of the selected fields.
 */
function toFieldTypes(arr) {
    res = []
    for (e of arr) {
        res.push(types[e]);
    }
    return res;
}

/**
 * This function simply plot a query.
 */
function plotALternativeEncoding(query) {
    queryclassName = JSON.stringify(query).replace(/\W/g, "");
    document.querySelector(
        `.alternative_encodings`
    ).innerHTML += `<div class='view_wrapper ${queryclassName}_wrapper'><i class='fas fa-bookmark add_bm' added="false"></i><div class='views ${queryclassName}' id="${queryclassName}"></div></div>`;
    queryMap[queryclassName] = query;
    plotRec(queryclassName, query);

}

/**
 * the function that generate categorical and quantitative field recommandations
 * */
function generateFieldRec(arr) {
    let restCateFields = [];
    let restQuantFields = [];

    // reinitialize views and count every time we redraw the cate views.
    document.querySelector(".categorical_views").innerHTML = ``;
    document.querySelector(".quantitative_views").innerHTML = ``;

    // fill the array [restCateFields] the rest of categorical fields.
    for (c of Fields.cate) {
        if (!arr.includes(c)) restCateFields.push(c);
    }
    // fill the array [restQuantFields] the rest of quantitative fields.
    for (c of Fields.trans_quant) {
        if (!arr.includes(c)) {
            if (c == "Rotten_Tomatoes")
                restQuantFields.push("Rotten_Tomatoes_Rating");
            restQuantFields.push(c);
        }
    }

    // for each of rest categorical field, generate a recommandation.
    for (c of restCateFields) plotWithRec([...arr], c, ".categorical_views");

    // for each of rest quantitative field, generate a recommandation.
    for (q of restQuantFields) plotWithRec([...arr], q, ".quantitative_views");
}

/**
 * the function that generate query and plot for selected fields and specific recommandation.
 *  parameter view represents the class name of div, where we need to plot the recommandations.
 */
function plotWithRec(arr, field, view) {
    let myVlSpec = generateRecommandation(arr, field);

    // this is id of assigned svg, since vegaEmbed assign one plot per div..
    let resarr = arr;
    resarr.push(field);

    // if there is a generated recommandation, plot it.
    // Other wise it is not recommanded.
    if (myVlSpec != undefined && myVlSpec != null) {
        let queryClassName = JSON.stringify(myVlSpec).replace(/\W/g, "");
        // create new div for new plot
        document.querySelector(view).innerHTML += `<div class='view_wrapper ${queryClassName}_wrapper'><i class='fas fa-bookmark add_bm' added="false"></i><div class="views cate" id='${queryClassName}'></div></div>`;
        queryMap[queryClassName] = myVlSpec;
        plotRec(queryClassName, myVlSpec);
    }
}

/*
 *  A function that generate recommandations for selected fields and a recommanded field.
 */
function generateRecommandation(arr, field) {
    if (field != null) {
        let myquery = generateQuery(arr, field);
        let myresult = cql.recommend(myquery, myschema, opt).result;
        var myvlTree = cql.result.mapLeaves(myresult, function (item) {
            return item.toSpec();
        });

        let myVlSpec = null;
        // generate small multiples for 3 fields recommandation.
        if (arr.length == 3) {
            myVlSpec = myvlTree.items[0];
        } else {
            for (r of myvlTree.items) {
                if (r == undefined) {
                    myVlSpec = undefined;
                    break;
                } else if (r["encoding"]["row"] == undefined) {
                    myVlSpec = r;
                }
            }
        }
        return myVlSpec;
    } else {
        var myquery = {};
        var myVlSpec;

        myquery = generateQuery(arr, null);
        var myresult = cql.recommend(myquery, myschema, opt).result;
        var myvlTree = cql.result.mapLeaves(myresult, function (item) {
            return item.toSpec();
        });
        myVlSpec = myvlTree.items[0];
        return myVlSpec;
    }
}

/**
 * a function that generate query for clicked fields.
 * if f is not null, then we are generating query with extra field f (related views).
 * else we will generate a query for the selected fields.
 */
function generateQuery(fields, f) {
    if (fields.length == 1) {
        var v1 = fields[0];
        if (f != null)
            return {
                spec: {
                    data: {
                        url: dataurl,
                    },
                    mark: "?",
                    encodings: [{
                            channel: "?",
                            field: v1,
                            type: types[v1],
                        },
                        {
                            channel: "?",
                            field: f,
                            type: types[f],
                        },
                    ],
                },
                chooseBy: "effectiveness",
            };
        return (spec_query = {
            spec: {
                data: {
                    url: dataurl,
                },
                mark: "?",
                encodings: [{
                    channel: "?",
                    field: v1,
                    type: types[v1],
                }, ],
            },
            chooseBy: "effectiveness",
        });
    }
    if (fields.length == 2) {
        var v1 = fields[0];
        var v2 = fields[1];
        if (f != null)
            return {
                spec: {
                    data: {
                        url: dataurl,
                    },
                    mark: "?",
                    encodings: [{
                            channel: "?",
                            field: v1,
                            type: types[v1],
                        },
                        {
                            channel: "?",
                            field: v2,
                            type: types[v2],
                        },
                        {
                            channel: "?",
                            field: f,
                            type: types[f],
                        },
                    ],
                },
                chooseBy: "effectiveness",
            };
        return {
            spec: {
                data: {
                    url: dataurl,
                },
                mark: "?",
                encodings: [{
                        channel: "?",
                        field: v1,
                        type: types[v1],
                    },
                    {
                        channel: "?",
                        field: v2,
                        type: types[v2],
                    },
                ],
            },
            chooseBy: "effectiveness",
        };
    } else {
        var v1 = fields[0];
        var v2 = fields[1];
        var v3 = fields[2];
        if (f != null)
            return {
                spec: {
                    data: {
                        url: dataurl,
                    },
                    mark: "?",
                    encodings: [{
                            channel: "?",
                            field: v1,
                            type: types[v1],
                        },
                        {
                            channel: "?",
                            field: v2,
                            type: types[v2],
                        },
                        {
                            channel: "?",
                            field: v3,
                            type: types[v3],
                        },
                        {
                            channel: "?",
                            field: f,
                            type: types[f],
                        },
                    ],
                },
                chooseBy: "effectiveness",
            };
        return {
            spec: {
                data: {
                    url: dataurl,
                },
                mark: "?",
                encodings: [{
                        channel: "?",
                        field: v1,
                        type: types[v1],
                    },
                    {
                        channel: "?",
                        field: v2,
                        type: types[v2],
                    },
                    {
                        channel: "?",
                        field: v3,
                        type: types[v3],
                    },
                ],
            },
            chooseBy: "effectiveness",
        };
    }
}