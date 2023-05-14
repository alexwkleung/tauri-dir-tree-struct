import { fs } from '@tauri-apps/api'
import { app, fileDirectoryBg, fileDirectoryTreeNode } from './dom-nodes.js'
import { isFile, isDirectory } from './is.js'

import './styles/style.css'

//app node
app.setAttribute("id", "app");
document.body.prepend(app);

fileDirectoryBg.setAttribute("id", "file-directory-bg");
app.appendChild(fileDirectoryBg);

//file directory tree node
fileDirectoryTreeNode.setAttribute("id", "file-directory-tree");
fileDirectoryBg.appendChild(fileDirectoryTreeNode);

/**
 * fReadDir function
 * 
 * @async  
 * @param dir The directory to read from
 * @returns An array containing file entries from the read directory
 */
async function fReadDir(dir: string): Promise<fs.FileEntry[]>  {
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
     * @async
     * @param numberOfParentNodes The number of parent nodes to be created
     * @param dirPropName The directory property names (folders for now)
     */
    public async createDirTreeParentNodes(numberOfParentNodes: number, dirPropName: string[]) {            
        for(let i = 0; i < numberOfParentNodes; i++) {
            //const canonical: string | unknown = await getCanonicalPath("Iris_Notes_Test/" + dirPropName[i]).then((v) => v);
            //console.log(canonical);

            await this.isRootParentFolder("desktop", "Iris_Notes_Test/" + dirPropName[i]).then(
                (v) => {
                    //if isRootParentFolder returns true
                    if(v) {
                        //create parent folder node
                        const parentFolder: HTMLDivElement = document.createElement('div');
                        parentFolder.setAttribute("class", "parent-of-root-folder");
                        fileDirectoryTreeNode.appendChild(parentFolder);

                        const parentFolderName: HTMLDivElement = document.createElement('div');
                        parentFolderName.setAttribute("class", "parent-folder-name");
                        parentFolder.appendChild(parentFolderName);

                        //create text node based on directory name
                        const pfTextNode: Text = document.createTextNode(dirPropName[i]);
                        parentFolderName.appendChild(pfTextNode);
                    //if isRootParentFolder returns false
                    } else if(!v) {
                        Promise.resolve(this.isRootParentFile("desktop", "Iris_Notes_Test/" + dirPropName[i])).then((
                            (vv) => {
                                if(vv) {
                                    //create parent folder node
                                    const parentFolder: HTMLDivElement = document.createElement('div');

                                    parentFolder.setAttribute("class", "child-of-root-folder");
                                    fileDirectoryTreeNode.appendChild(parentFolder);

                                    //create text node based on directory name
                                    const pfTextNode: Text = document.createTextNode(dirPropName[i]);
                                    parentFolder.appendChild(pfTextNode);
                                }
                            }
                        )).catch((e) => {
                            throw console.error(e);
                        });                        
                    }
                }
            ).catch((e) => {
                throw console.error(e);
            }); 
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
            
            parentTags.appendChild(childTree);
            
            //need to check if child is a directory folder or a file
            //and set class attribute accordingly
        }
    }

    public async isRootParentFolder(baseDir: string, dirPropName: string): Promise<unknown> {
        //log
        //console.log(await isDirectory(baseDir, dirPropName).then((v) => v))
        return await isDirectory(baseDir, dirPropName).then((v) => v).catch((e) => { throw console.error(e) });
    }

    public async isRootParentFile(baseDir: string, dirPropName: string): Promise<unknown> {
        return await isFile(baseDir, dirPropName).then((v) => v).catch((e) => { throw console.error(e) });
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
    public async getDirNames(dir: string): Promise<string[]> {
        const directoryNamesTemp: string[] = [];
        const directoryNames: string[] = [];

        //get directory (folder) names
        const propRes: number[] = await fDirProps(fReadDir(dir), "name").then(
            (v) => v.map((elem: any) => directoryNamesTemp.push(elem))
        ).catch((e) => e);
    
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
        const getParentTags: HTMLCollectionOf<Element> = fileDirectoryTreeNode.getElementsByClassName('parent-of-root-folder');

        const getParentNameTags: HTMLCollectionOf<Element> = fileDirectoryTreeNode.getElementsByClassName('parent-folder-name');
        
        //log
        //console.log(getParentTags);

        const parentTagsArr: string[] = [];

        //iterate over parent tags
        for(let i = 0; i < getParentTags.length; i++) {
            //for every parent tag, get the textContent value from the node
            parentTagsArr.push(getParentTags[i].textContent);
        }

        //log
        //console.log(parentTagsArr);

        console.log(getParentTags.length);
        console.log(getParentNameTags.length);

        //for all parent tags
        for(let i = 0; i < getParentTags.length; i++) {     
            //when any parent tag (folder) is clicked
            getParentNameTags[i].addEventListener('click', async () => {
                //toggle the `is-active-parent` class when parent tag is clicked
                getParentTags[i].classList.toggle('is-active-parent');

                //check if parent tag is active (has 'is-active-parent' class)
                if(getParentTags[i].classList.contains('is-active-parent')) {
                    //log
                    //console.log("Iris_Notes_Test" + "/" + parentTagsArr[i]);

                    //append the children of the clicked parent folder
                    this.createDirTreeChildNodes(
                        await this.getDirNames(dir + parentTagsArr[i]).then((v) => v.length).catch(
                            (e) => { throw console.error(e) }
                        ), 
                        await this.getDirNames(dir + parentTagsArr[i]),
                        getParentTags[i]
                    );

                    //log
                    //console.log(await this.getDirNames(dir + parentTagsArr[i]).then((v) => v.length));
                    //console.log(await this.getDirNames(dir + parentTagsArr[i]).then((v) => v));

                    //log
                    console.log('parent active');
                //if parent tag is inactive (does not have 'is-active-parent' class)
                } else if(!getParentTags[i].classList.contains('is-active-parent')) {
                    //remove the children of the parent folder from the dom
                    getParentTags[i].querySelectorAll('.child-of-parent-folder').forEach((v) => v.remove());

                    //log
                    console.log('parent inactive');
                }

                //log
                console.log("clicked on parent folder!");
            });
        }   
    }
}

//invoke 
async function invokeF(): Promise<void> {
    //create DirectoryTree object
    const dirTree = new DirectoryTree();

    const dirTreeListeners = new DirectoryTreeListeners();
    
    //log
    //console.log(await fDirProps(fReadDir("Iris_Notes"), "name").then((v) =>  v.length));

    await dirTree.createDirTreeParentNodes(
        await dirTree.getDirNames("Iris_Notes_Test").then(
            (v) => v.length).catch((e) => { throw console.error(e) }), 
        await dirTree.getDirNames("Iris_Notes_Test").catch((e) => { throw console.error(e) })
    );

    //console.log(await fDirProps(fReadDir("Iris_Notes_Test/Sample Notes"), "name").then((v) =>  v));
    
    /*
    console.log(dirTree.createDirTreeParentNodes(
        await dirTree.getDirNames("Iris_Notes_Test/Sample Notes").then((v) => v.length),
        await dirTree.getDirNames("Iris_Notes_Test/Sample Notes")
    ));
    */

    dirTreeListeners.parentFolderListener("Iris_Notes_Test/");

    //testing get canonical path
    //await getCanonicalPath("Iris_Notes_Test/Sample Notes").then((v) => console.log(v));
} 
invokeF();
