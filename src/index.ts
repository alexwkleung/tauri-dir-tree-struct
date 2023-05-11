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
//console.log(fDirProps(fReadDir("Iris_Notes"), "name"));
//console.log(fDirProps(fReadDir("Iris_Notes"), "path"));

class DirectoryTree {
    private directoryNamesTemp: string[] = [];
    private directoryNames: string[] = [];

    public createDirTreeParentNodes(numberOfParentNodes: number, dirPropName: string[]) {            
        for(let i = 0; i < numberOfParentNodes; i++) {
            //create parent folder node
            const parentFolder: HTMLDivElement = document.createElement('div');
            parentFolder.setAttribute("class", "parent-folder-of-root");
            fileDirectoryTreeNode.appendChild(parentFolder);

            //create text node based on directory name
            const pfTextNode = document.createTextNode(dirPropName[i])
            parentFolder.appendChild(pfTextNode)
        }
    }

    public async getDirNames() {
        //const directoryNamesTemp: string[] = [];
    
        //get directory (folder) names
        const propRes: number[] = await fDirProps(fReadDir("Iris_Notes"), "name").then(
            (v) => v.map((elem: any) => this.directoryNamesTemp.push(elem))
        );
    
        //log
        //console.log(directoryNamesTemp);
    
        //const directoryNames: string[] = [];
    
        for(let i = 0; i < this.directoryNamesTemp.length; i++) {
            //temporarily filter out .DS_Store
            if(this.directoryNamesTemp[i] !== ".DS_Store") {
                this.directoryNames.push(this.directoryNamesTemp[i]);
            }
        }
    
        //log
        //console.log(this.directoryNames);
    
        for(let i = 1; i < this.directoryNames.length; i++) {
            await fDirProps(fReadDir("Iris_Notes/" + this.directoryNames[i]), "name").then(
                (v) => v.map((elem) => elem)
            )
        }

        return this.directoryNames;
    }

    /*
    public createDirectoryTree() {

    }
    */
}

//invoke 
async function invoke(): Promise<void> {
    //create DirectoryTree object
    const dirTree = new DirectoryTree();

    //test log
    //console.log(await fDirProps(fReadDir("Iris_Notes"), "name").then((v) =>  v.length));

    dirTree.createDirTreeParentNodes(
        await dirTree.getDirNames().then((v) => v.length), 
        await dirTree.getDirNames()
    );
} 
invoke();


//const childFolder
//const childFile
//const rootFolderChild