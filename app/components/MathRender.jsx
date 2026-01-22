import React, { useState, useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const MathRender = ({ content, style, textColor = '#000', fontSize = 16 }) => {
    const [height, setHeight] = useState(40);
    const [isLoaded, setIsLoaded] = useState(false);

    if (!content) return null;

    // Check if content contains LaTeX delimiters using includes (Faster/Safer than Regex on large strings)
    const hasLatex = typeof content === 'string' && (
        content.includes('\\[') ||
        content.includes('\\(') ||
        content.includes('$$') ||
        content.includes('\\text{') ||
        content.includes('\\frac') ||
        content.includes('\\sqrt') ||
        (content.toLowerCase().includes('<br')) ||
        (content.toLowerCase().includes('<p')) ||
        (content.toLowerCase().includes('<b')) ||
        (content.toLowerCase().includes('<i')) ||
        (content.toLowerCase().includes('<span')) ||
        (content.toLowerCase().includes('<sub')) ||
        (content.toLowerCase().includes('<sup')) ||
        (content.toLowerCase().includes('<strong')) ||
        (content.toLowerCase().includes('<em'))
    );

    if (!hasLatex) {
        return <Text style={[{ color: textColor }, style]}>{content}</Text>;
    }

    // KaTeX HTML Template
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"></script>
        <style>
            body { 
                font-size: ${fontSize}px; 
                color: ${textColor}; 
                background-color: transparent; 
                margin: 0; 
                padding: 4px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                overflow-y: hidden; /* Prevent internal scrollbars */
            }
            #content {
                display: inline-block;
                width: 100%;
                word-wrap: break-word;
                white-space: pre-line; /* Preserves newlines from backend */
            }
            .katex { font-size: 1.1em; } 
        </style>
    </head>
    <body>
        <div id="content">
            ${content}
        </div>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                renderMathInElement(document.body, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\\\(', right: '\\\\)', display: false},
                        {left: '\\\\[', right: '\\\\]', display: true}
                    ],
                    throwOnError : false
                });

                // Report Height
                function sendHeight() {
                    var h = document.getElementById('content').offsetHeight + 10;
                    window.ReactNativeWebView.postMessage(h.toString());
                }
                
                // Slight delay to ensure rendering is complete
                setTimeout(sendHeight, 100);
                setTimeout(sendHeight, 500); // Backup
            });
        </script>
    </body>
    </html>
    `;

    return (
        <View style={[style, { height: height, opacity: 0.99 }]}>
            <WebView
                originWhitelist={['*']}
                source={{ html }}
                style={{ backgroundColor: 'transparent' }}
                scrollEnabled={false}
                onMessage={(event) => {
                    const h = Number(event.nativeEvent.data);
                    if (!isNaN(h) && h > 0) {
                        setHeight(h);
                        setIsLoaded(true);
                    }
                }}
                showsVerticalScrollIndicator={false}
                androidLayerType="hardware"
            />
        </View>
    );
};

export default MathRender;
