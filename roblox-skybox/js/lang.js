let lang = {
    jp: {
        header_title: "パノラマ to Robloxスカイボックス",
        hero_title: "パノラマ to Robloxスカイボックス",
        hero_subtitle:
            "360°パノラマ画像をRobroxの6面スカイボックス画像に変換します",
        title_1: "パノラマ画像をアップロード",
        line_1_1: "縦横比が1:2の等角円筒図法のパノラマ画像",
        line_1_2:
            "画像フォーマットはPNG、JPEG、WebPに対応。EXR、HDRには非対応です。変換するには：",
        line_1_3: "パノラマ画像の入手は：",
        line_1_4: "ファイルを選択",
        line_1_5: "ここにドラッグアンドドロップ",
        line_1_6: "ファイル名:",
        line_1_7: "横 x 縦:",
        title_2: "ダウンロード",
        line_2_1: "右のリンクをクリックして、各ファイルをダウンロードしてください",
        line_2_2: "生成中...",
        line_2_3: "角度を入力すると正面の向きを変更できます：",
        line_2_4: "右面:",
        line_2_5: "左面",
        line_2_6: "前面",
        line_2_7: "後面",
        line_2_8: "上面",
        line_2_9: "下面",
        line_2_10: "記号＋ファイル名",
        line_2_11: "ファイル名＋記号",
        title_3: "Roblox Studioで設定",
        line_3_1:
            "Roblox StudioでLightingのSkyに設定します。ファイル名の先頭と、Skyのプロパティ名を合わせてください",
        error_multiple_files: "アップロードできるファイルはひとつだけです",
        error_not_image:
            "画像ファイル（PNG、JPEG、WebP）をアップロードしてください",
    },
    en: {
        header_title: "Panorama to Roblox Skybox",
        hero_title: "Panorama to Roblox Skybox",
        hero_subtitle:
            "Convert 360° panorama images to Roblox's 6-face skybox images",
        title_1: "Upload Panorama Image",
        line_1_1:
            "Panorama image with an aspect ratio of 1:2 in equidistant cylindrical projection",
        line_1_2:
            "Image formats supported are PNG, JPEG, WebP: EXR, HDR are not supported. To convert:",
        line_1_3: "Obtaining panorama images:",
        line_1_4: "Select file",
        line_1_5: "drag and drop here",
        line_1_6: "File name:",
        line_1_7: "Width x Height:",
        title_2: "Download",
        line_2_1: "Click the link on the right to download each file.",
        line_2_2: "Generating...",
        line_2_3: "You can change the front direction by entering the angle:",
        line_2_4: "Right:",
        line_2_5: "Left",
        line_2_6: "Front",
        line_2_7: "Back",
        line_2_8: "Up",
        line_2_9: "Down",
        line_2_10: "Prefix + File name",
        line_2_11: "File name + Suffix",
        title_3: "Setting in Roblox Studio",
        line_3_1:
            "Configure the Sky in Roblox Studio's Lighting to match the beginning of the file name with the Sky property name.",
        error_multiple_files: "Only one file can be uploaded.",
        error_not_image: "Please upload an image file.(PNG、JPEG、WebP)",
    },
};

let currentLanguage = "jp";

function changeLanguage(language) {
    currentLanguage = language;

    let elements = document.querySelectorAll("[data-lang-key]");
    elements.forEach(function (element) {
        let key = element.getAttribute("data-lang-key");
        element.textContent = lang[language][key];
    });
}
