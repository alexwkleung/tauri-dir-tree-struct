pub fn dir_vec(base_dir: String) -> bool {
    let dir_vec: Vec<String> = vec![
        String::from("desktop"), 
        String::from("home")
    ];

    let mut dir_vec_bool: bool = false;

    for iter in dir_vec {
        if iter == "desktop" && base_dir == "desktop" {
            dir_vec_bool = true;
        } else if iter == "home" && base_dir == "home" {
            dir_vec_bool = true;
        }
    }

    return dir_vec_bool;
}