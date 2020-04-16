var cql = require("compassql");
var dataurl = "data/movies.json";
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
    Rotten_Tomatoes_Rating: "ordinal",
    Running_Time_min: "quantitative",
    US_DVD_Sales: "quantitative",
    US_Gross: "quantitative",
    Worldwide_Gross: "quantitative",
    // COUNT: "quantitative",
};

var fieldLst = document.querySelector(".attr-lst");
var mainImg = document.querySelector(".mainImg");
var opt = {};
var checkedBoxes = [];
var myschema = null;
var myData = null;
var svgCount = 0;

d3.json(dataurl).then(assignSchema);

/**
 *  does what is says, assign schema for CompassQL recommandation generation.
 */
function assignSchema(data) {
    myData = data;
    myschema = cql.schema.build(data, opt);
    initField(Fields);
}

/**
 * a helper function that put all attrbutes to field list on sidenav.
 * */
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

/**
 *  does what it said.. it init the field list on sidenav.
 * */
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

/**
 * this function is called by clicking on the sidenav
 * */
function readFields() {
    let allCheckboxes = document.querySelectorAll("form .enabled input");
    let checkedNames = [];
    let selectedBoxes = [];
    let i = 0;

    // collect selected fields
    for (box of allCheckboxes) {
        if (box.checked) {
            selectedBoxes[i] = box;
            let s = box.value.split(" ").join("_");
            if (s == "Rotten_Tomatoes")
                checkedNames[i] = "Rotten_Tomatoes_Rating";
            else
                checkedNames[i] = s;
            i++;
        }
    }
    // if nothing is checked, display the message.
    if (checkedNames.length == 0) {
        mainImg.innerHTML = `Welcome! Please select fields to generate recommanded charts.`;
        document.querySelector(".related_main_area").style.display = "none";
        document.querySelector(".categorical_views").innerHTML = "";
        document.querySelector(".quantitative_views").innerHTML = "";
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
    document.querySelector(".related_main_area").style.display = "unset";
    // generate specified and related views
    generatePlot(checkedNames);
    generateFieldRec(checkedNames);
    return false;
}

/**
 *  helper function that revert the selection of fields
 *  */
function revertSelections(checkedBoxes) {
    let allCheckboxes = document.querySelectorAll("form .enabled input");
    for (box of allCheckboxes) {
        if (checkedBoxes.includes(box)) box.checked = true;
        else box.checked = false;
    }
}

/**
 * method that generate specified view.
 * */
function generatePlot(arr) {
    var spec_query = {};
    var specVlSpec;

    spec_query = generateQuery(arr, null);
    var spec_result = cql.recommend(spec_query, myschema, opt).result;
    var spec_vlTree = cql.result.mapLeaves(spec_result, function (item) {
        return item.toSpec();
    });
    specVlSpec = spec_vlTree.items[0];
    plot(specVlSpec);
}

/**
 * the function that generate categorical and quantitative field recommandations
 * */
function generateFieldRec(arr) {
    var cate_query = {};
    var cateVlSpec;
    var quant_query = {};
    var quantVlSpec;
    let restCateFields = [];
    let restQuantFields = [];
    // reinitialize views and count every time we redraw the cate views.
    svgCount = 0;
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
    for (c of restCateFields) {
        cate_query = generateQuery(arr, c);
        var cate_result = cql.recommend(cate_query, myschema, opt).result;
        var cate_vlTree = cql.result.mapLeaves(cate_result, function (item) {
            return item.toSpec();
        });

        // generate small multiples for 3 fields recommandation.
        if (arr.length == 3) {
            cateVlSpec = cate_vlTree.items[0];
        } else {
            for (r of cate_vlTree.items) {
                if (r == undefined) {
                    cateVlSpec = undefined;
                    break;
                } else if (r["encoding"]["row"] == undefined) {
                    cateVlSpec = r;
                }
            }
        }

        // this is id of assigned svg, since vegaEmbed assign one plot per div..
        let str = `view${svgCount}`;

        // if there is a generated recommandation, plot it.
        // Other wise it is not recommanded.
        if (cateVlSpec != undefined) {
            // create new div for new plot
            document.querySelector(
                ".categorical_views"
            ).innerHTML += `<div class="views cate" id="${str}"></div>`;
            plotCate(str, cateVlSpec);
            svgCount++;
        }

    }

    // for each of rest quantitative field, generate a recommandation.
    for (q of restQuantFields) {
        quant_query = generateQuery(arr, q);
        var quant_result = cql.recommend(quant_query, myschema, opt).result;
        var quant_vlTree = cql.result.mapLeaves(quant_result, function (item) {
            return item.toSpec();
        });

        // generate small multiples for 3 fields recommandation.
        if (arr.length == 3) {
            quantVlSpec = quant_vlTree.items[0];
        } else {
            for (r of quant_vlTree.items) {
                if (r == undefined) {
                    quantVlSpec = undefined;
                    break;
                } else if (r["encoding"]["row"] == undefined) {
                    quantVlSpec = r;
                }
            }
        }

        // this is id of assigned svg, since vegaEmbed assign one plot per div..
        let str = `view${svgCount}`;

        // if there is a generated recommandation, plot it.
        // Other wise it is not recommanded.
        if (quantVlSpec != undefined) {
            // create new div for new plot
            document.querySelector(
                ".quantitative_views"
            ).innerHTML += `<div class="views cate" id="${str}"></div>`;
            plotCate(str, quantVlSpec);
            svgCount++;
        }

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