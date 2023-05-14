use walkdir::WalkDir;
use std::path::{Path, PathBuf};
use std::vec::Vec;

#[tauri::command(rename_all = "snake_case")]
pub fn walk(dir: String) -> Vec<String> {
    let base_dir: String = String::from(
        dirs::desktop_dir()
        .unwrap()
        .to_string_lossy()
    );

    let current_dir: String = base_dir + &dir;

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