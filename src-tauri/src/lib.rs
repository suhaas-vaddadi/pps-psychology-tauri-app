use tauri_plugin_fs::FsExt;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;
use std::fs;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn write_csv_ratings(path: String, contents: Vec<String>) -> Result<(), String> {
    let file_exists = Path::new(&path).exists();
    
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;

    if !file_exists {
        writeln!(file, "SubID,PartnerID,dyad,computer,subjectInitials,saveFolder,raName,sessionTime,sessionDate,timestamp,taskOrder,Rating,EmoRating,EmoRating_Person,Time,stopTime,Movietime,Shift,Description,trialNumber,softwareVersion")
            .map_err(|e| e.to_string())?;
    }

    for line in contents {
        writeln!(file, "{}", line).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn write_csv_transitions(path: String, contents: Vec<String>) -> Result<(), String> {
    let file_exists = Path::new(&path).exists();
    
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;

        if !file_exists {
            writeln!(file, "dyadId,participantId,partnerId,computer,subjectInitials,saveFolder,raName,sessionTime,sessionDate,sessionTimestamp,ratingTask,subTask,emotion1,emotion2,ratingPerson,response,trialNumber,softwareVersion")
                .map_err(|e| e.to_string())?;
        }
    
        for line in contents {
            writeln!(file, "{}", line).map_err(|e| e.to_string())?;
        }
        Ok(())

}

#[tauri::command]
fn setup_rating_directory(base_path: String, dyad_id: String, participant_id: String, partner_id: String, initials: String) -> Result<String, String> {
    let dyad_folder = format!("{}/{}_{}_{}_{}/", base_path, dyad_id, participant_id, partner_id, initials);
    
    // Create directories if they don't exist
    fs::create_dir_all(&dyad_folder).map_err(|e| e.to_string())?;
    
    // Return the participant folder path
    Ok(dyad_folder)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let scope = app.fs_scope();
            let _ = scope.allow_directory("/", false);
            dbg!(scope.is_allowed("/"));
            use tauri::Manager;
            let window = app.get_webview_window("main").unwrap();
            window.set_fullscreen(true).unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, write_csv_ratings, write_csv_transitions, setup_rating_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
