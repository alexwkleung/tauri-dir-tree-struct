// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//use is_directory
use app::{
  __cmd__is_file, 
  __cmd__is_directory, 
  is::{is_directory, is_file},
  __cmd__get_canonical_path, 
  get_canonical_path::get_canonical_path
};

fn main() {
  tauri::Builder::default()
  //create invoke handler for tauri so functions can be invoked in front-end
    .invoke_handler(tauri::generate_handler![is_file, is_directory, get_canonical_path])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
