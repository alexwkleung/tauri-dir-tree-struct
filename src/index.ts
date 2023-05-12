import { fs } from '@tauri-apps/api'
import { app, fileDirectoryBg, fileDirectoryTreeNode } from './dom-nodes.js'

import './styles/style.css'

//app node
app.setAttribute("id", "app");
document.body.prepend(app);

//file directory bg
fileDirectoryBg.setAttribute("id", "file-directory-bg");
app.appendChild(fileDirectoryBg);

//file directory tree node
fileDirectoryTreeNode.setAttribute("id", "file-directory-tree");
fileDirectoryBg.appendChild(fileDirectoryTreeNode);

//read dir function
async function fReadDir(dir: string)  {
    const readDir: fs.FileEntry[] = await fs.readDir(dir, {
        dir: fs.BaseDirectory.Desktop,
        recursive: true
    });

    //log
    //console.log(readDir);

    return readDir;
}

//dir props function
function fDirProps(
    readDir: Promise<fs.FileEntry[]>, 
    propType: string
    ): Promise<(fs.FileEntry[] | undefined)[]> | Promise<(string | undefined)[]> | undefined {    

    //dir props obj for conditions
    const DirProps = {
        pChildren: "children",
        pName: "name",
        pPath: "path"
    }

    //when propType matches DirProps property value(s), assign resolved promise callback value 
    //to rv as a reference which will be returned later
    let rv: Promise<(fs.FileEntry[] | undefined)[]> | Promise<(string | undefined)[]> | undefined;

    if(propType === DirProps.pChildren) {
        //get children properties (of folders)
        const rdChildren: Promise<(fs.FileEntry[] | undefined)[]> = Promise.resolve(readDir).then(
            (v) => v.map((props) => props.children)
        );
        rv = rdChildren;
    } else if(propType === DirProps.pName) {
        //get name properties (root folder/files)
        const rdName: Promise<(string | undefined)[]> = Promise.resolve(readDir).then(
            (v) => v.map((props) => props.name)
        );
        rv = rdName;
    } else if(propType === DirProps.pPath) {
        //get path properties
        const rdPath: Promise<string[]> = Promise.resolve(readDir).then(
            (v) => v.map((props) => props.path)
        ); 
        rv = rdPath;
    }

    return rv;
}

//logs
//console.log(fDirProps(fReadDir("Iris_Notes/Folder"), "name"));
//console.log(fDirProps(fReadDir("Iris_Notes/Folder"), "path"));

//logs
//console.log(fDirProps(fReadDir("Iris_Notes"), "children"));
//console.log(fDirProps(fReadDir("Iris_Notes/Sample Notes"), "name"));
//console.log(fDirProps(fReadDir("Iris_Notes"), "path"));

class DirectoryTree {
    public createDirTreeParentNodes(numberOfParentNodes: number, dirPropName: string[]) {            
        for(let i = 0; i < numberOfParentNodes; i++) {
            //create parent folder node
            const parentFolder: HTMLDivElement = document.createElement('div');

            //initial active state
            parentFolder.setAttribute("id", "not-active-parent");

            parentFolder.setAttribute("class", "parent-folder-of-root");
            fileDirectoryTreeNode.appendChild(parentFolder);

            //create text node based on directory name
            const pfTextNode: Text = document.createTextNode(dirPropName[i]);
            parentFolder.appendChild(pfTextNode);
        }
    }

    //this correlates to parent folder listener, so check logic
    public createDirTreeChildNodes(numberOfChildNodes: number, dirPropName: string[]) {
        for(let i = 0; i < numberOfChildNodes; i++) {
            const childTree: HTMLDivElement = document.createElement('div');
            childTree.setAttribute("class", "child-of-parent-folder");

            const ctTextNode: Text = document.createTextNode(dirPropName[i]);
            childTree.appendChild(ctTextNode);

            const parentNodeT: HTMLDivElement = document.querySelector('.parent-folder-of-root');
            parentNodeT.appendChild(childTree);
        }
    }

    /*
    public isChildFolder(): boolean {
        return;
    }

    public isRootChildFile(): boolean {
        return;
    }
    */

    public async getDirNames(dir: string) {
        const directoryNamesTemp: string[] = [];
        const directoryNames: string[] = [];

        //get directory (folder) names
        const propRes: number[] = await fDirProps(fReadDir(dir), "name").then(
            (v) => v.map((elem: any) => directoryNamesTemp.push(elem))
        );
    
        for(let i = 0; i < directoryNamesTemp.length; i++) {
            //temporarily filter out .DS_Store
            if(directoryNamesTemp[i] !== ".DS_Store") {
                directoryNames.push(directoryNamesTemp[i]);
            }
        }
    
        //log
        //console.log(directoryNames);

        return directoryNames;
    }

    /*
    public createDirectoryTree() {

    }
    */
}

class DirectoryTreeListeners extends DirectoryTree {
    public parentFolderListener() {
        const fileDirTreeSelector: HTMLDivElement = document.querySelector('#file-directory-tree');

        const getParentTags: HTMLCollectionOf<Element> = fileDirTreeSelector.getElementsByClassName('parent-folder-of-root');

        const parentTagsArr: string[] = [];

        //iterate over parent tags
        for(let i = 0; i < getParentTags.length; i++) {
            //for every parent tag, get the textContent value from the node
            parentTagsArr.push(getParentTags[i].textContent);
        }

        //log
        //console.log(parentTagsArr);

        //for all parent tags
        for(let i = 0; i < getParentTags.length; i++) {     
            //when any parent tag (folder) is clicked
            getParentTags[i].addEventListener('click', async () => {  
                if(getParentTags[i].getAttribute("not-active-parent")) {
                    return;
                } else {
                    //set clicked parent div id to 'is-active-parent'
                    getParentTags[i].setAttribute("id", "is-active-parent")

                    const childLength: number = await this.getDirNames("Iris_Notes/" + parentTagsArr[i]).then(
                        (v) => v.length
                    );

                    //log
                    //console.log(parentTagsArr[i]);

                    //log
                    //console.log(childLength);

                    /*
                    this.createDirTreeChildNodes(
                        childLength, 
                        await this.getDirNames("Iris_Notes/" + parentTagsArr[i]).then(
                            (c) => c
                    ));   
                    */

                    //log
                    //console.log(await this.getDirNames("Iris_Notes/" + parentTagsArr[i]));
                }

                //log
                console.log("clicked on parent folder!");
            });
        }   
    }
}

//invoke 
async function invoke(): Promise<void> {
    //create DirectoryTree object
    const dirTree = new DirectoryTree();

    const dirTreeListeners = new DirectoryTreeListeners();
    
    //log
    //console.log(await fDirProps(fReadDir("Iris_Notes"), "name").then((v) =>  v.length));

    dirTree.createDirTreeParentNodes(
        await dirTree.getDirNames("Iris_Notes").then((v) => v.length), 
        await dirTree.getDirNames("Iris_Notes")
    );

    dirTreeListeners.parentFolderListener();
} 
invoke();
