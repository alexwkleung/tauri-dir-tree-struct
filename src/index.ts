import { app, fileDirectoryBg, fileDirectoryTreeNode } from './dom-nodes.js'
import { /*isFile,*/ isDirectory, /*isDirectoryCanonical,*/ /*isFileCanonical*/ } from './is.js'
import { walk } from './walkdir.js'
import { getName, getDirectoryName, getNameVec } from './file.js'
//import { getCanonicalPath } from './get-canonical-path.js'
import { baseDir } from './base-dir.js'

import './styles/style.css'

//app node
app.setAttribute("id", "app");
document.body.prepend(app);

fileDirectoryBg.setAttribute("id", "file-directory-bg");
app.appendChild(fileDirectoryBg);

//file directory tree node
fileDirectoryTreeNode.setAttribute("id", "file-directory-tree");
fileDirectoryBg.appendChild(fileDirectoryTreeNode);

export class DirectoryTree {
    /**
     * createDirTreeParentNodes
     * 
     * @async
     */
    public async createDirTreeParentNodes() {  
        let walkRef: string[] = [];
        
        //walk directory recursively
        await walk(await baseDir("desktop").then((v) => v) + "/Iris/Notes").then(async (v) => {
                walkRef = (v as string[]).slice(1);
            }
        ).catch((v) => { throw console.error(v) });

        const nameVecTemp: string[] = [];

        await getNameVec(await baseDir("desktop").then((v) => v) + "/Iris/Notes").then(async (props) => {
            (props as string[]).map(async (v) => {
                nameVecTemp.push(v);
            }
        )}).catch((e) => { throw console.error(e) });

        const rootFolderNamesVec: string[] = nameVecTemp.filter((filter: string): boolean => {
            return [".DS_Store"].some((end) => {
                return !filter.endsWith(end);
            })
        });

        rootFolderNamesVec.map(async (props) => {
            await this.isFolderNode("desktop", "/Iris/Notes/" + props).then(
                async (vv) => {
                  if(vv) {
                        //create parent folder node
                        const parentFolder: HTMLDivElement = document.createElement('div');
                        parentFolder.setAttribute("class", "parent-of-root-folder");
                        fileDirectoryTreeNode.appendChild(parentFolder);

                        const parentFolderName: HTMLDivElement = document.createElement('div');
                        parentFolderName.setAttribute("class", "parent-folder-name");
                        parentFolder.appendChild(parentFolderName);

                        //create text node based on directory name
                        const pfTextNode: Text = document.createTextNode(props);
                        parentFolderName.appendChild(pfTextNode);
                    } else if(!vv) {
                        //create parent folder node
                        const childFileRoot: HTMLDivElement = document.createElement('div');

                        childFileRoot.setAttribute("class", "child-file-name");
                        fileDirectoryTreeNode.appendChild(childFileRoot);

                        //create text node based on directory name
                        const pfTextNode: Text = document.createTextNode(props);
                        childFileRoot.appendChild(pfTextNode);
                    }
                }
            ).catch((e) => {
                throw console.error(e);
            });
        });
    }

    /**
     * createDirTreeChildNodes
     * 
     * @async 
     * @param parentTags The parent tag to append to (based on clicked parent)
     * @param parentNameTags The parent name tag
     */
    public async createDirTreeChildNodes(
        parentTags: Element, 
        parentNameTags: string,
        base: string) {

        let walkRef: string[] = [];
        
        //walk directory recursively
        await walk(
            await baseDir(base).then((v) => v) + "/Iris/Notes/" + parentNameTags
        ).catch((e) => { throw console.error(e) }).then(
            (v) => {
                walkRef = (v as string[]).slice(1);
            }
        ).catch((v) => { throw console.error(v) });

        const dirNamesArr: string[] = [];
        //get directory name (canonical)
        for(let i = 0; i < walkRef.length; i++) {
            await getDirectoryName(walkRef[i]).then((props) => {
                dirNamesArr.push(props as string);
            }).catch((e) => { throw console.error(e) });
        }
        const namesArr: string[] = [];

        //get file name (includes parent dir name) 
        for(let i = 0; i < walkRef.length; i++) {
            await getName(walkRef[i]).then((props) => {
                namesArr.push(props as string);
            }).catch((e) => { throw console.error(e) });
        }

        for(let i = 0; i < namesArr.length; i++) {
            if(namesArr[i] !== parentNameTags) {
                const childFile: HTMLDivElement = document.createElement('div');
                childFile.setAttribute("class", "child-file-name");
    
                const ctTextNode: Text = document.createTextNode(namesArr[i]);
                childFile.appendChild(ctTextNode);
                
                //append to passed parent node
                parentTags.appendChild(childFile);
            }
        }
    }

    public async isFolderNode(baseDir: string, dirPropName: string): Promise<unknown> {
        return await isDirectory(baseDir, dirPropName).then(
            (v) => v
        ).catch((e) => { throw console.error(e) });
    }
}

export class DirectoryTreeListeners extends DirectoryTree {
    public parentRootListener(): void {
        document.querySelector('#file-directory-tree').addEventListener("click", (e) => {
            //must use event delegation to handle events on dynamically created nodes or else it gets executed too early!
            const target = (e.target as Element).closest("#file-directory-tree");
          
            if(target) {
                const getParentTags: HTMLCollectionOf<Element> = target.getElementsByClassName('parent-of-root-folder');
                const getParentNameTags: HTMLCollectionOf<Element> = target.getElementsByClassName('parent-folder-name');

                const parentTagsArr: string[] = [];
                Array.from(getParentTags).forEach(
                    (v) => parentTagsArr.push(v.textContent)
                );
        
                const parentNameTagsArr: string[] = [];
                Array.from(getParentNameTags).forEach(
                    (v) => parentNameTagsArr.push(v.textContent)
                );

                for(let i = 0; i < getParentTags.length; i++) {
                    //console.log(getParentTags[i]);
                    getParentNameTags[i].addEventListener('click', (e) => { 
                        //need to use stopImmediatePropagation on event handler so child nodes can be removed from the dom
                        e.stopImmediatePropagation();

                        //console.log(e);
                        
                        getParentTags[i].classList.toggle('is-active-parent');

                        if(getParentTags[i].classList.contains('is-active-parent')) {
                            this.createDirTreeChildNodes(getParentTags[i], parentNameTagsArr[i], "desktop");
                        } else if(!getParentTags[i].classList.contains('is-active-parent')) {
                            getParentTags[i].querySelectorAll('.child-file-name').forEach((v) => v.remove());
                        }
                    });
                }
            }

           
            //call child node listener once parent listener finishes execution
            this.childNodeListener();
          });
    }

    public childNodeListener() {
        document.querySelectorAll('.child-file-name').forEach(
            (v) => v.addEventListener('click', (e) => {
                e.stopImmediatePropagation();

                //console.log(e);
                v.classList.toggle('is-active-child');

                console.log("child file");
        }));
    }
}

//invoke 
async function invokeF(): Promise<void> {
    const dirTree = new DirectoryTree();
    const dirTreeListeners = new DirectoryTreeListeners();

   await dirTree.createDirTreeParentNodes();
   
   dirTreeListeners.parentRootListener();
} 
invokeF();