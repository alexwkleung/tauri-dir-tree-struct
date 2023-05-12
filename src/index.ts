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

/**
 * fDirProps 
 * 
 * @param readDir The directory to read from
 * @param propType The directory property type to be returned
 * @returns The directory children, name, or path
 */
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
    /**
     * createDirTreeParentNodes
     * 
     * @param numberOfParentNodes The number of parent nodes to be created
     * @param dirPropName The directory property names (folders for now)
     */
    public createDirTreeParentNodes(numberOfParentNodes: number, dirPropName: string[]) {            
        for(let i = 0; i < numberOfParentNodes; i++) {
            //create parent folder node
            const parentFolder: HTMLDivElement = document.createElement('div');

            parentFolder.setAttribute("class", "parent-folder-of-root");
            fileDirectoryTreeNode.appendChild(parentFolder);

            //create text node based on directory name
            const pfTextNode: Text = document.createTextNode(dirPropName[i]);
            parentFolder.appendChild(pfTextNode);
        }
    }

    /**
     * createDirTreeChildNodes
     * 
     * @param numberOfChildNodes The number of child nodes to be created 
     * @param dirPropName The directory property names (folders, files)
     * @param parentTags The parent tag to append to (based on clicked parent)
     */
    public createDirTreeChildNodes(numberOfChildNodes: number, dirPropName: string[], parentTags: Element) {
        for(let i = 0; i < numberOfChildNodes; i++) {
            const childTree: HTMLDivElement = document.createElement('div');
            childTree.setAttribute("class", "child-of-parent-folder");

            const ctTextNode: Text = document.createTextNode(dirPropName[i]);
            childTree.appendChild(ctTextNode);

            //const parentNodeT: HTMLDivElement = document.querySelector('.parent-folder-of-root');

            parentTags.appendChild(childTree);
            
            //need to check if child is a directory folder or a file
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

    /**
     * getDirNames
     * 
     * @param dir The directory to get names from
     * @returns The directory names (folders, files)
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
    public parentFolderListener(dir: string) {
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
                //select every parent div with class 'parent-folder-of-root'  
                if(getParentTags[i].querySelectorAll('.parent-folder-of-root')) {
                    //toggle the `is-active-parent` class when parent tag is clicked
                    getParentTags[i].classList.toggle('is-active-parent');

                    //check if parent tag is active (has 'is-active-parent' class)
                    if(getParentTags[i].classList.contains('is-active-parent')) {
                        //log
                        console.log("Iris_Notes_Test" + "/" + parentTagsArr[i]);

                        //append the children of the clicked parent folder
                        this.createDirTreeChildNodes(
                            await this.getDirNames(dir + parentTagsArr[i]).then((v) => v.length), 
                            await this.getDirNames(dir + parentTagsArr[i]),
                            getParentTags[i]
                        );

                        //log
                        console.log(await this.getDirNames(dir + parentTagsArr[i]).then((v) => v.length));

                        //console.log(getParentTags[i].getElementsByClassName('child-of-parent-folder'));

                        //log
                        console.log('parent active');
                    //if parent tag is inactive (does not have 'is-active-parent' class)
                    } else if(!getParentTags[i].classList.contains('is-active-parent')) {
                        //remove the children of the parent folder from the dom
                        getParentTags[i].querySelectorAll('.child-of-parent-folder').forEach((v) => v.remove());

                        //log
                        console.log('parent inactive');
                    }
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
        await dirTree.getDirNames("Iris_Notes_Test").then((v) => v.length), 
        await dirTree.getDirNames("Iris_Notes_Test")
    );

    console.log(await fDirProps(fReadDir("Iris_Notes_Test/Sample Notes"), "name").then((v) =>  v));
    
    /*
    console.log(dirTree.createDirTreeParentNodes(
        await dirTree.getDirNames("Iris_Notes_Test/Sample Notes").then((v) => v.length),
        await dirTree.getDirNames("Iris_Notes_Test/Sample Notes")
    ));
    */

    dirTreeListeners.parentFolderListener("Iris_Notes_Test/");
} 
invoke();
