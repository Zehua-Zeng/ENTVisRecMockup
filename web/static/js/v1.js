var cql = require("compassql");

var Fields = {
    cate: [
        "MPAA Rating",
        "Source",
        "Creative Type",
        "Director",
        "Distributor",
        "Major Genre",
        "Title",
    ],
    date: ["Release Date"],
    trans_quant: [
        "IMDB Rating",
        "IMDB Votes",
        "Production Budget",
        "Rotten Tomatoes",
        "Running Time min",
        "US DVD Sales",
        "US Gross",
        "Worldwide Gross",
    ],
};

var types = {
    MPAARating: "ordinal",
    Source: "nominal",
    CreativeType: "nominal",
    Director: "nominal",
    Distributor: "nominal",
    MajorGenre: "nominal",
    Title: "nominal",
    ReleaseDate: "date",
    IMDBRating: "ordinal",
    IMDBVotes: "quantitative",
    ProductionBudget: "quantitative",
    RottenTomatoes: "ordinal",
    RunningTimemin: "quantitative",
    USDVDSales: "quantitative",
    USGross: "quantitative",
    WorldwideGross: "quantitative",
    COUNT: "quantitative",
};

var fieldLst = document.querySelector(".attr-lst");
var mainImg = document.querySelector(".mainImg");
var opt = {};
var checkedBoxes = [];
var myschema = null;
var myData = null;

d3.json("/data/movies.json").then(assignSchema);

function assignSchema(data) {
    myData = data;
    myschema = cql.schema.build(data, opt);
    initField(Fields);
}

/* a helper function that put all attrbutes to field list on sidenav.*/
function addFields(fields) {
    let res = "";
    let disabledstr = "";
    let enabledstr = "enabled";
    for (e of fields.cate) {
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
    }
    for (e of fields.date) {
        res += `<li class="cate-attr ${enabledstr} ${disabledstr}">
                    <div>
                        <i class="fas fa-calendar-alt"></i> &nbsp;
                        <label class="form-check-label" for="${e}"> ${e} </label>
                        <span class="check float-right">
                            <input class="form-check-input" type="checkbox" value="${e}" id="${e}" ${disabledstr} />
                        </span>
                    </div>
                </li>`;
    }
    for (e of fields.trans_quant) {
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
    }

    fieldLst.innerHTML += res;
}

// does what it said.. it init the field list on sidenav.
function initField(fields) {
    fieldLst.innerHTML = "";
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
        });
    }
}

// this function is called by clicking on the sidenav
function readFields() {
    let allCheckboxes = document.querySelectorAll("form .enabled input");
    let checkedNames = [];
    let selectedBoxes = [];
    let i = 0;

    // collect selected fields
    for (box of allCheckboxes) {
        if (box.checked) {
            selectedBoxes[i] = box;
            checkedNames[i] = box.value.split(" ").join("_");
            if (checkedNames[i] == "Rotten_Tomatoes")
                checkedNames[i] = "Rotten_Tomatoes_Rating";
            i++;
        }
    }
    // if nothing is checked, display the message.
    if (checkedNames.length == 0) {
        mainImg.innerHTML = `Welcome! Please select fields to generate recommanded charts.`;
        return false;
    }
    // if checked too many fields, revert the changes.
    if (checkedNames.length > 3) {
        alert(
            `You have selected more than 3 fields! Unavailable selections has been reverted.`
        );
        revertSelections(checkedBoxes);
        return false;
    }

    // save the changes if we succeed
    checkedBoxes = selectedBoxes;
    generatePlot(checkedNames);

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

// method that generate recomandations and plot
function generatePlot(arr) {
    var query = {};
    var topVlSpec;
    if (arr.length == 1) {
        var v1 = arr[0];
        query = {
            spec: {
                data: {
                    url: "/data/movies.json",
                },
                mark: "?",
                encodings: [{
                    channel: "?",
                    field: v1,
                    type: types[v1],
                }, ],
            },
            chooseBy: "effectiveness",
        };
        var result = cql.recommend(query, myschema, opt).result;
        var vlTree = cql.result.mapLeaves(result, function (item) {
            return item.toSpec();
        });
        topVlSpec = vlTree.items[0];
    } else if (arr.length == 2) {
        var v1 = arr[0];
        var v2 = arr[1];

        query = {
            spec: {
                data: {
                    url: "/data/movies.json",
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
        var result = cql.recommend(query, myschema, opt).result;
        var vlTree = cql.result.mapLeaves(result, function (item) {
            return item.toSpec();
        });
        topVlSpec = vlTree.items[0];
    } else {
        var v1 = arr[0];
        var v2 = arr[1];
        var v3 = arr[2];
        query = {
            spec: {
                data: {
                    url: "/data/movies.json",
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
        var result = cql.recommend(query, myschema, opt).result;
        var vlTree = cql.result.mapLeaves(result, function (item) {
            return item.toSpec();
        });
        topVlSpec = vlTree.items[0];
    }
    //   console.log(topVlSpec);
    plot(topVlSpec);
}