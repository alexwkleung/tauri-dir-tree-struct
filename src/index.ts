import { fs } from '@tauri-apps/api'

import './styles/style.css'

//read dir function
async function fReadDir(dir: string)  {
    const readDir: fs.FileEntry[] = await fs.readDir(dir, {
        dir: fs.BaseDirectory.Desktop,
        recursive: true
    });

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
    //to rtv as a reference which will be returned later
    let rtv: Promise<(fs.FileEntry[] | undefined)[]> | Promise<(string | undefined)[]> | undefined;

    if(propType === DirProps.pChildren) {
        //get children properties (of folders)
        const rdChildren: Promise<(fs.FileEntry[] | undefined)[]> = Promise.resolve(readDir).then(
            (v) => v.map((props) => props.children)
        );
        
        rtv = rdChildren;
    } else if(propType === DirProps.pName) {
        //get name properties (files)
        const rdName: Promise<(string | undefined)[]> = Promise.resolve(readDir).then(
            (v) => v.map((props) => props.name)
        );

        rtv = rdName;
        return rtv;
    } else if(propType === DirProps.pPath) {
        //get path properties
        const rdPath: Promise<string[]> = Promise.resolve(readDir).then(
            (v) => v.map((props) => props.path)
        ); 

        rtv = rdPath;
    }

    return rtv;
}

console.log(fDirProps(fReadDir("Iris_Notes/folder"), "name"));
console.log(fDirProps(fReadDir("Iris_Notes/folder"), "path"));

console.log(fDirProps(fReadDir("Iris_Notes"), "children"));
console.log(fDirProps(fReadDir("Iris_Notes"), "name"));
console.log(fDirProps(fReadDir("Iris_Notes"), "path"));