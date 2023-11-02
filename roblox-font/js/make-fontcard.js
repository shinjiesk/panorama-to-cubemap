document.addEventListener("DOMContentLoaded", function () {
    const fontsArray = [
        {
            name: "Source Sans Bold (4)",
            family: "Source Sans 3",
            weight: "700",
            style: "normal",
        },
        {
            name: "Source Sans Light (5)",
            family: "Source Sans 3",
            weight: "300",
            style: "normal",
        },
        {
            name: "Source Sans Italic (6)",
            family: "Source Sans 3",
            style: "italic",
            weight: "normal",
        },
        {
            name: "Bodoni (7)",
            family: "Libre Bodoni",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Garamond (8)",
            family: "Cormorant Garamond",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Source Sans Semibold (16)",
            family: "Source Sans 3",
            weight: "600",
            style: "normal",
        },
        {
            name: "Amatic SC (21)",
            family: "Amatic SC",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Bangers (22)",
            family: "Bangers",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Creepster (23)",
            family: "Creepster",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Denk One (24)",
            family: "Denk One",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Fondamento (25)",
            family: "Fondamento",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Grenze Gotisch (27)",
            family: "Grenze Gotisch",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Indie Flower (28)",
            family: "Indie Flower",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Josefin Sans (29)",
            family: "Josefin Sans",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Jura (30)",
            family: "Jura",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Kalam (31)",
            family: "Kalam",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Luckiest Guy (32)",
            family: "Luckiest Guy",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Merriweather (33)",
            family: "Merriweather",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Michroma (34)",
            family: "Michroma",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Nunito (35)",
            family: "Nunito",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Oswald (36)",
            family: "Oswald",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Patrick Hand (37)",
            family: "Patrick Hand",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Permanent Marker (38)",
            family: "Permanent Marker",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Roboto (39)",
            family: "Roboto",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Roboto Condensed (40)",
            family: "Roboto Condensed",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Roboto Mono (41)",
            family: "Roboto Mono",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Sarpanch (42)",
            family: "Sarpanch",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Special Elite (43)",
            family: "Special Elite",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Titillium Web (44)",
            family: "Titillium Web",
            weight: "normal",
            style: "normal",
        },
        {
            name: "Ubuntu (45)",
            family: "Ubuntu",
            weight: "normal",
            style: "normal",
        },
        // 他のフォントの情報を必要に応じてここに追加
    ];

    // フォントカードを追加する親要素を取得
    const fontsContainer = document.getElementById("fonts");

    // 配列の各フォントに対してループ処理
    fontsArray.forEach(function (font) {
        // フォントカードのdivを作成
        const fontCard = document.createElement("div");
        fontCard.classList.add("font-card");

        // フォント名のdivを作成
        const fontName = document.createElement("div");
        fontName.classList.add("font-name");
        fontName.textContent = font.name;
        fontCard.appendChild(fontName);

        // フォントサンプルのdivを作成
        const fontSample = document.createElement("div");
        fontSample.classList.add("font-sample");
        fontSample.textContent = "Sample Text";
        fontSample.style.fontFamily = font.family;
        fontSample.style.fontWeight = font.weight;
        fontSample.style.fontStyle = font.style;
        fontCard.appendChild(fontSample);

        // 作成したフォントカードを親要素に追加
        fontsContainer.appendChild(fontCard);
    });
});
