use walkdir::WalkDir;
use std::path::{Path, PathBuf};
use std::vec::Vec;

#[tauri::command(rename_all = "snake_case")]
pub fn walk() -> Vec<String> {
    let current_dir = String::from(
        dirs::desktop_dir()
        .unwrap()
        .to_string_lossy()
        + "/Iris_Notes_Test/"
    );

    let path: &Path = Path::new(&current_dir);

    let walkdir_vec: Vec<PathBuf> = WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .map(|x| x.path().to_owned())
        .collect();

    let mut path_vec: Vec<String> = Vec::new();

    for entry in walkdir_vec {
        path_vec.push(
            entry
            .into_os_string()
            .into_string()
            .unwrap()
        );
    }

    return path_vec;
}