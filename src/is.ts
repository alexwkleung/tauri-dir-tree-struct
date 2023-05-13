import { invoke } from "@tauri-apps/api"

/**
 * isFile function
 * @param fileDir The directory of the file to pass into invoked `is_file` function from `is.rs`
 * @returns A boolean value if path is a file
 */
export async function isFile(baseDir: string, fileDir: string): Promise<unknown> {
    const isFile: boolean | unknown = await invoke(
        "is_file", { base_dir: baseDir, file_dir: fileDir }
    ).then((v) => v);

    return isFile;
}
 
/**
 * isDirectory function
 * 
 * @param dir The directory to pass into invoked `is_directory` function from `is.rs`
 * @returns A boolean value if path is a directory (folder)
 */
export async function isDirectory(baseDir: string, dir: string): Promise<unknown> {
    const isDirectory: boolean | unknown = await invoke(
        "is_directory", { base_dir: baseDir, dir: dir }
    ).then((v) => v);

    return isDirectory;
}