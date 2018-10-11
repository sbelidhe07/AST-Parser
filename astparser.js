var fs = require('fs');
var flow = require('flow-parser');
const searchDir = './app/containers'; 


var files = []
var can_skip = ['FeaturePage' , 'LocaleToggle' , 'LanguageProvider', 'ReportListItem', 'NotFoundPage', 'RepoListItem']

  fs.readdirSync(searchDir).forEach(folder => {
    var dir = searchDir + '/' + folder;
    fs.readdirSync(dir).forEach(file => {
        if (file == 'index.js') {
            if (can_skip.indexOf(folder) < 0) 
                files.push(dir + '/' + file);
        }
    })
})

for (f in files) {

    var file = files[f];
    console.log('Checking ' + file);
    var code = fs.readFileSync(file, 'utf-8');  
    let ast = flow.parse(code, {});
    rowcounter = 0;
    containercounter = 0;
    var map = new Map();
    function print_jsx_tree(jsx_ast,nest_cnt) {
        var attrVal = '';
        try {
             Array(nest_cnt).join(' '); 
             if (jsx_ast.openingElement) {
                    if (jsx_ast.openingElement.attributes[0] && jsx_ast.openingElement.attributes[0].value) {
                    attrVal = jsx_ast.openingElement.attributes[0].value.value;
                    }
                }
            var children = jsx_ast.children;
            var key ='';
         
           
             if (attrVal && attrVal == 'row') {
                 rowcounter ++;
                 key = 'row-' + rowcounter;
                
             }
             if (attrVal && attrVal == 'container') {
                 containercounter ++;
                 key = 'container-' + containercounter;
                
             }
            for(var sp=0;children && sp<children.length;sp++) {

                if (children[sp].openingElement && children[sp].openingElement.attributes[0]) { 
                    var x = children[sp].openingElement.attributes[0]; 
                    if (x && key) {
                        map.set(key+'-'+sp, children[sp].openingElement.attributes[0].value.value);
                    } 
                } else if (key) {
                    if (children[sp].openingElement) {
                      map.set(key+'-'+sp, children[sp].openingElement.name.name);
                  }
                }

                if (children[sp] && children[sp].type == 'JSXElement') {
                    print_jsx_tree(children[sp],nest_cnt + 1);
                }
            }

     }catch(e) {
        console.log(e);
     }   

        return;
    }
    for (i in ast.body) 
    {
        try
        {
            var x = JSON.stringify(ast.body[i]);
            if (x.indexOf("argument") != -1) 
            {
                for (j in ast.body[i].declaration.body.body) 
                {
                    for (k in ast.body[i].declaration.body.body[j].value.body.body) 
                    {
                        x = ast.body[i].declaration.body.body[j].value.body.body[k].argument;
                        if (x) 
                        {
                           print_jsx_tree(x,1);
                        }
                    }
                }
            }
        } catch(e) {

        } 
    }

    
       if (map.size > 0) {    
           console.log(map); 
        }          


}
