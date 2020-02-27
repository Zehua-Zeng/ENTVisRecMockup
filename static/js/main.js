
var Fields = {
    cate: ["Creative Type","Director","Distributor","Major Genre","MPAA Rating","Source","Title"],
    date: ["Release Date"],
    trans_quant: ["IMDB Rating","IMDB Votes", "Production Budget","Rotten Tomatoes", "Running Time min","US DVD Sales","US Gross","Worldwide Gross"],
    quant: ["COUNT"]
};
var fieldLst = document.querySelector(".attr-lst");

// a helper function that put all attrbutes to field list on sidenav.
function addFields(fields){
    let res = "";
    for (e of fields.cate) {
        res+=`<li class="cate-attr">
                <div>
                    <i class="fas fa-font"></i> &nbsp;
                    <span> ${e} </span>
                    <span class="float-right">
                        <i class="fas fa-filter"></i>
                        <i class="fas fa-plus"></i></i>
                    </span>
                </div>
            </li>`;
    }
    for (e of fields.date) {
        res+=`<li class="cate-attr">
                <div>
                    <i class="fas fa-calendar-alt"></i> &nbsp;
                    <span> ${e} </span>
                    <span class="float-right">
                        <i class="fas fa-filter"></i>
                        <i class="fas fa-plus"></i></i>
                    </span>
                </div>
            </li>`;
    }
    for (e of fields.trans_quant) {
        res+=`<li class="trans-quant-attr">
                <div>
                    <i class="fas fa-caret-down"></i> &nbsp;
                    <i class="fas fa-hashtag"></i> &nbsp;
                    <span> ${e}</span>
                    <span class="float-right">
                        <i class="fas fa-filter"></i>
                        <i class="fas fa-plus"></i></i>
                    </span>
                </div>
            </li>`;
    }
    for (e of fields.quant) {
        res+=`<li class="quant-attr">
                <div>
                    <i class="fas fa-hashtag"></i> &nbsp;
                    <span> COUNT</span>
                    <span class="float-right">
                        <i class="fas fa-filter"></i>
                        <i class="fas fa-plus"></i></i>
                    </span>
                </div>
            </li>`;
    }
    fieldLst.innerHTML+=res;
}

// does what it said.. it init the field list on sidenav.
function initField(fields){
    fieldLst.innerHTML='';
    addFields(fields);
};

initField(Fields);