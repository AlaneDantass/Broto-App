// Prevents additional console windows on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_deep_link::DeepLinkExt;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_deep_link::init())
    .setup(|app| {
      #[cfg(desktop)]
      {
        app.deep_link().register("broto")?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
