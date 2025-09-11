// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // CLI 引数に --dev があるか確認
    let args: Vec<String> = std::env::args().collect();
    let open_devtools = args.iter().any(|a| a == "--dev");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(move |app| {
            // 最初のウィンドウを取得して devtools を開く
            if open_devtools {
                #[allow(unused_must_use)]
                {
                    let handle = app.handle();
                    if let Some(window) = handle.get_webview_window("main") {
                        let _ = window.open_devtools();
                    }
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
