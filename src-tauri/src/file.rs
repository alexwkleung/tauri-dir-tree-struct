use std::{path::Path, ffi::OsString};

#[tauri::command(rename_all = "snake_case")]
pub fn get_file_name(dir: String) -> String {  
    let path: &Path = Path::new(&dir);

    let path_name: String = String::from(
        path.file_name()
        .unwrap_or(&OsString::from(""))
        .to_str()
        .unwrap_or("")
    );

    return path_name;
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_directory_name(dir: String) -> String {
    let path: &Path = Path::new(&dir);

    let path_parent: String = String::from(
        path.parent()
        .unwrap()
        .to_string_lossy()
    );

    return path_parent;
}