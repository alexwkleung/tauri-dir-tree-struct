import { invoke } from "@tauri-apps/api"

/**
 * getCanonicalPath function
 * 
 * @param dir The directory to pass into invoked `get_canonical_path` function from `get_canonical_path.rs`
 * @returns A string representation of the canonical path
 */
export async function getCanonicalPath(dir: string): Promise<unknown> { 
    const canonicalPath: string | unknown = await invoke(
        "get_canonical_path", { dir: dir }
    ).then(
        (v) => {
            if(v) {
                return v;    
            } else if (!v){
                throw console.error(v);
            }
        }
    );

    return canonicalPath;
}