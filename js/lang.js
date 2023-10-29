let lang = {
    jp: {
        header_title: "パノラマ to Robloxスカイボックス",
        hero_title: "パノラマ to Robloxスカイボックス",
        hero_subtitle: "360°パノラマ画像をRobroxの6面スカイボックス画像に変換します",
        title_1: "パノラマ画像を用意する",
        line_1_1: "縦横比が1:2の等角円筒図法のパノラマ画像",
        line_1_2: "画像フォーマットはPNG、JPEG、WebPに対応（EXR、HDRには非対応です。変換するには:",
        line_1_3: "パノラマ画像の入手は:",
        title_2: "パノラマ画像をアップロード",
        line_2_1: "ファイルを選択またはここにドラッグアンドドロップ",
        title_3: "ダウンロード",
        line_3_1: "それぞれの面をクリックしてダウンロードしてください。",
        line_3_2: "生成中...",
        line_3_3: "回転させて正面の向きを変更できます:",
        title_4: "Roblox Studioで設定",
        line_4_1: "Roblox Studioで、LightingのSkyに設定します。ファイル名の末尾とプロパティ名を合わせてください。",
    },
    en: {
        header_title: "Panorama to Roblox Skybox",
        hero_title: "Panorama to Roblox Skybox",
        hero_subtitle: "Convert 360° panorama images to Roblox's 6-face skybox images",
        title_1: "Prepare Panorama Image",
        line_1_1: "Panorama image with an aspect ratio of 1:2 in equidistant cylindrical projection",
        line_1_2: "Image formats supported are PNG, JPEG, WebP (EXR, HDR are not supported. To convert:",
        line_1_3: "Obtaining panorama images:",
        title_2: "Upload Panorama Image",
        line_2_1: "Select file or drag and drop here",
        title_3: "Download",
        line_3_1: "Click on each face to download.",
        line_3_2: "Generating...",
        line_3_3: "You can change the direction of the front by rotating:",
        title_4: "Setting in Roblox Studio",
        line_4_1: "In Roblox Studio, set it to Lighting's Sky. Match the end of the filename with the property name.",
        

    }
};

function changeLanguage(language) {
    let elements = document.querySelectorAll('[data-lang-key]');
    elements.forEach(function(element) {
        let key = element.getAttribute('data-lang-key');
        element.textContent = lang[language][key];
    });
}
