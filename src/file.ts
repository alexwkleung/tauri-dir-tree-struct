import { invoke } from "@tauri-apps/api"

export async function getFileName(dir: string) {
    return await invoke('get_file_name', { dir: dir }).then(
        (v) => v
    ).catch((e) => { throw console.error(e) });
}

export async function getDirectoryName(dir: string) {
    return await invoke('get_directory_name', { dir: dir }).then(
        (v) => v
    ).catch((e) => { console.error(e) });
}