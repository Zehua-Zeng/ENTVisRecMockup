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

var bookmarkContent = document.querySelector(".bookmark_content");
var fieldLst = document.querySelector(".attr-lst");
var mainImg = document.querySelector(".mainImg");
var queryMap = {};
var opt = {};
var myschema = null;
var myData = null;

// names of selected field
var checkedFields = [];

document.querySelector("#main_wrapper").style.display = "none";
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
    i.addEventListener("click", onClickEvent);
  }

  let modal = document.querySelector("#popup");
  let btn = document.querySelector("#bookmark");
  let closeBtn = document.querySelector(".close");

  // When the user clicks on the button, toggle the modal
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


/**
 *  This function display all marked charts in popup window
 */
function refreshBookmark() {
  let arr = bookmarkContent.childNodes;
  let v2keys = [];
  let btnstrs = [];
  for (var i = 0; i < window.localStorage.length; i++) {
    let key = localStorage.key(i);
    if (key.startsWith("v2_")) v2keys.push(key);
  }

  if (v2keys.length == 0) {
    bookmarkContent.innerHTML =
      "Oops, you don't have any bookmark yet. Click on bookmark tags on charts to add a bookmark!";
  } else {
    bookmarkContent.innerHTML = "";
    for (key of v2keys) {
      let k = key.substring(3);
      let value = window.localStorage.getItem(key);

      // creat div structure append to the popup window.
      bookmarkContent.innerHTML += `<div class="view_wrapper ${k}_wrapper_bm" ><i class="fas fa-bookmark add_bm" added="true"></i><div class="views cate" id="${k}_bm"></div></div>`;

      let markedFields = value.split(",");
      let myVlSpec = undefined;

      // generate recommandation according to marked fields 
      if (markedFields.length > 3)
        myVlSpec = generateRecommandation(markedFields.slice(0, 3), arr[4]);
      else myVlSpec = generateRecommandation(markedFields, null);
      // plot the recommandation
      plotRec(`${k}_bm`, myVlSpec);

      btnstrs.push(`.${k}_wrapper_bm i`);
      let btn = document.querySelector(`.${k}_wrapper_bm i`);

      // change color and attribute of bookmark.
      btn.style.color = "#60608A";
      btn.setAttribute("added", "true");
    }
    // add event listener to new bookmark
    for (btn of btnstrs)
      document.querySelector(btn).addEventListener("click", toggleBookMark);

  }
}

/**
 *  This function is the onclick event of input fields
 */
function onClickEvent(e) {
  let box = e.target;
  queryMap = {};
  if (box != null) {
    let s = box.value.split(" ").join("_");
    // if a box is checked after the click
    if (box.checked) {
      // if we can check more fields add the field in.
      // also add its parsed name to the list.
      if (checkedFields.length < 3) {
        checkedFields.push(s);
        document.querySelector(".related_main_area").style.display = "inherit";
        // if we can not check more fields, alert it.
      } else {
        alert(`You have selected more than 3 fields!`);
        box.checked = false;
        return;
      }

      // if a box is unchecked after the click,
      // also remove its parsed name from the list.
    } else {
      checkedFields = checkedFields.filter(function (value, index, arr) {
        return value.localeCompare(s) != 0;
      });
      // if 0 fields are checked, display alternative message.
      if (checkedFields.length == 0) {
        mainImg.innerHTML = ` Welcome! Please select fields to generate recommanded charts.`;
        document.querySelector(".related_main_area").style.display = "none";
        document.querySelector(".categorical_views").innerHTML = "";
        document.querySelector(".quantitative_views").innerHTML = "";
        return;
      }
    }
  }
  let fieldStr = "";
  for (s of checkedFields) {
    fieldStr += s;
  }

  mainImg.innerHTML = `<div id="main_wrapper" class="view_wrapper ${fieldStr}_wrapper"><i class="fas fa-bookmark add_bm" added="false"></i><div class="views ${fieldStr}" id="main"></div></div>`;
  generatePlot(checkedFields, fieldStr);
  generateFieldRec(checkedFields);

  // add event listeners to all bookmark buttons on the page
  let btns = document.querySelectorAll(".add_bm");
  for (btn of btns) {
    btn.addEventListener("click", toggleBookMark);
  }
  // change color and state of a bookmark if a wrapper is in the bookmark content.
  let wrappers = document.querySelectorAll(".view_wrapper");

  for (wrapper of wrappers) {
    let item = `v2_${wrapper.classList.item(1).split("_wrapper")[0]}`;
    if (
      window.localStorage.getItem(item) != null &&
      window.localStorage.getItem(item) != undefined
    ) {
      wrapper.querySelector("i").style.color = "#60608A";
      wrapper.querySelector("i").setAttribute("added", "true");
      // console.log(wrapper.classList.item(1).split("_bm")[0] + " exists!! " + btn.style.color);
    }
  }
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
    window.localStorage.removeItem(`v2_${str.split("_wrapper")[0]}`);

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

    let splittedStr = `${str.split("_wrapper")[0]}`;

    // if there is currently no charts, empty its inner html.
    if (window.localStorage.length == 0) {
      bookmarkContent.innerHTML = "";
    }
    // tracks query for the bookmark in local storage.
    window.localStorage.setItem(`v2_${splittedStr}`, queryMap[splittedStr]);

  }
}

/**
 * method that generate specified view.
 * */
function generatePlot(arr, str) {
  var specVlSpec = generateRecommandation([...arr], null);
  queryMap[str] = [...arr];
  plot(specVlSpec);
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
 */
function plotWithRec(arr, field, view) {
  let myVlSpec = generateRecommandation(arr, field);

  // this is id of assigned svg, since vegaEmbed assign one plot per div..
  let resarr = arr;
  resarr.push(field);
  let fieldStr = "";
  for (s of arr) {
    fieldStr += s;
  }

  // if there is a generated recommandation, plot it.
  // Other wise it is not recommanded.
  if (myVlSpec != undefined && myVlSpec != null) {
    // create new div for new plot
    document.querySelector(
      view
    ).innerHTML += `<div class="view_wrapper ${fieldStr}_wrapper"><i class="fas fa-bookmark add_bm" added="false"></i><div class="views cate" id="${fieldStr}"></div></div>`;
    queryMap[fieldStr] = resarr;
    plotRec(fieldStr, myVlSpec);
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