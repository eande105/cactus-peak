import type { ThemeDocument } from './lib/theme-model';

// Exact current project snapshot. Keep the internal theme identity for preview behavior.
export const theme: ThemeDocument = {
  "schemaVersion": 2,
  "name": "Cactus Peak Athletic",
  "theme": {
    "name": "Base",
    "text": {
      "l": {
        "size": 24,
        "lineHeight": 30
      },
      "m": {
        "size": 16,
        "lineHeight": 24
      },
      "s": {
        "size": 14,
        "lineHeight": 20
      },
      "xl": {
        "size": 36,
        "lineHeight": 40
      },
      "xs": {
        "size": 12,
        "lineHeight": 16
      },
      "xxl": {
        "size": 48,
        "lineHeight": 52
      },
      "xxs": {
        "size": 11,
        "lineHeight": 14
      }
    },
    "fonts": {
      "ui": {
        "family": "\"Sidebar Inter\", sans-serif",
        "weights": {
          "heavy": 600,
          "medium": 500,
          "regular": 400
        }
      },
      "data": {
        "family": "\"Archivo\", sans-serif",
        "weights": {
          "heavy": 700,
          "medium": 500,
          "regular": 400
        }
      },
      "brand": {
        "family": "\"Archivo\", sans-serif",
        "weights": {
          "heavy": 800,
          "medium": 600,
          "regular": 500
        }
      },
      "editorial": {
        "family": "\"Sidebar Inter\", sans-serif",
        "weights": {
          "heavy": 600,
          "medium": 500,
          "regular": 400
        }
      }
    },
    "border": {
      "l": 2,
      "m": 1,
      "s": 1,
      "none": 0
    },
    "colors": {
      "dark": {
        "error": "#f28b7c",
        "color-1": "#e0804f",
        "color-2": "#3e6b55",
        "color-3": "#b5532c",
        "color-4": "#3a2418",
        "color-5": "#7fb0e8",
        "color-6": "#ee9a6e",
        "color-7": "#f5a396",
        "success": "#6fcb94",
        "warning": "#f2b14c",
        "neutral-1": "#121a16",
        "neutral-2": "#1a241f",
        "neutral-3": "#24302a",
        "neutral-4": "#34423a",
        "neutral-5": "#4a5850",
        "neutral-6": "#6e7f74",
        "neutral-7": "#a69f92",
        "neutral-8": "#cfc8bb",
        "neutral-9": "#e6e0d5",
        "neutral-10": "#f2ece2"
      },
      "light": {
        "error": "#b42318",
        "color-1": "#b5532c",
        "color-2": "#1c3328",
        "color-3": "#e0804f",
        "color-4": "#f6dfd3",
        "color-5": "#2e6db4",
        "color-6": "#9e4522",
        "color-7": "#8f1c13",
        "success": "#2a7047",
        "warning": "#8a5300",
        "neutral-1": "#ffffff",
        "neutral-2": "#fbf8f3",
        "neutral-3": "#f6f1e8",
        "neutral-4": "#efe7da",
        "neutral-5": "#ddd2c1",
        "neutral-6": "#8c7f6b",
        "neutral-7": "#6b6457",
        "neutral-8": "#4a443a",
        "neutral-9": "#2e2a23",
        "neutral-10": "#1d1b17"
      }
    },
    "radius": {
      "l": 20,
      "m": 14,
      "s": 10,
      "xl": 28,
      "xs": 4,
      "full": 9999,
      "zero": 0
    },
    "shadows": {
      "l": {
        "x": 0,
        "y": 12,
        "blur": 30,
        "color": {
          "dark": "neutral-1",
          "light": "neutral-10"
        },
        "spread": 0,
        "opacity": 0
      },
      "m": {
        "x": 0,
        "y": 8,
        "blur": 24,
        "color": {
          "dark": "neutral-1",
          "light": "neutral-10"
        },
        "spread": 0,
        "opacity": 0
      },
      "s": {
        "x": 0,
        "y": 1,
        "blur": 2,
        "color": {
          "dark": "neutral-1",
          "light": "neutral-10"
        },
        "spread": 0,
        "opacity": 0
      }
    },
    "spacing": {
      "l": 24,
      "m": 16,
      "s": 12,
      "xl": 32,
      "xs": 8,
      "xxl": 48,
      "xxs": 4,
      "zero": 0
    },
    "animation": {
      "large": {
        "easing": [
          0.16,
          1,
          0.3,
          1
        ],
        "duration": 300
      },
      "easing": [
        0.2,
        0.8,
        0.2,
        1
      ],
      "duration": 150,
      "popupScale": 0.96,
      "pressDistance": 1
    },
    "iconStyle": "outlined",
    "iconFamily": "Lucide",
    "neutralTone": "warm",
    "buttonRadius": "s",
    "colorEmphasis": 50,
    "letterSpacing": {
      "l": 0.01,
      "m": 0,
      "s": -0.02,
      "xl": 0.02,
      "xs": -0.03
    },
    "primaryForeground": {},
    "primaryActionColor": "color-1",
    "colorPalettes": [
      {
        "id": "atlas-party",
        "name": "Party orange",
        "description": "Orange with deep blue, clear sky, and soft peach.",
        "colors": {
          "light": [
            "#ff5a00",
            "#153d85",
            "#bfe8f5",
            "#ffd0b0"
          ],
          "dark": [
            "#ff5a00",
            "#153d85",
            "#bfe8f5",
            "#ffd0b0"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-nectarine",
        "name": "Nectarine",
        "description": "Golden orange with pine, peach, and a little violet.",
        "colors": {
          "light": [
            "#ff9800",
            "#00906c",
            "#ffd3af",
            "#5100c0"
          ],
          "dark": [
            "#ff9800",
            "#00906c",
            "#ffd3af",
            "#5100c0"
          ]
        },
        "primaryForeground": {
          "light": "neutral-9",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-caramel",
        "name": "Caramel",
        "description": "Warm caramel with deep blue, lavender, and pale apricot.",
        "colors": {
          "light": [
            "#cf9148",
            "#07376b",
            "#c9b8f5",
            "#ffe0b8"
          ],
          "dark": [
            "#cf9148",
            "#07376b",
            "#c9b8f5",
            "#ffe0b8"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-ochre",
        "name": "Ochre",
        "description": "Golden ochre with deep green, cornflower, and soft butter yellow.",
        "colors": {
          "light": [
            "#d4b441",
            "#085e55",
            "#91b9fa",
            "#fff0b8"
          ],
          "dark": [
            "#d4b441",
            "#085e55",
            "#91b9fa",
            "#fff0b8"
          ]
        },
        "primaryForeground": {
          "light": "neutral-9",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-summer",
        "name": "Summer yellow",
        "description": "Sunny yellow grounded by violet and softened with pink and green.",
        "colors": {
          "light": [
            "#ffea00",
            "#5100c0",
            "#ffc0ff",
            "#398574"
          ],
          "dark": [
            "#ffea00",
            "#5100c0",
            "#ffc0ff",
            "#398574"
          ]
        },
        "primaryForeground": {
          "light": "neutral-9",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-kryptonite",
        "name": "Kryptonite",
        "description": "Electric lime with deep green, petal pink, and a cool blue.",
        "colors": {
          "light": [
            "#abff5a",
            "#085e55",
            "#ffc0ff",
            "#80d8e8"
          ],
          "dark": [
            "#abff5a",
            "#085e55",
            "#ffc0ff",
            "#80d8e8"
          ]
        },
        "primaryForeground": {
          "light": "neutral-9",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-leaf",
        "name": "Leaf green",
        "description": "Bright leaf green with violet, soft lilac, and pale yellow.",
        "colors": {
          "light": [
            "#6dcc00",
            "#5100c0",
            "#ddc7ff",
            "#ffed9b"
          ],
          "dark": [
            "#6dcc00",
            "#5100c0",
            "#ddc7ff",
            "#ffed9b"
          ]
        },
        "primaryForeground": {
          "light": "neutral-9",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-fresh",
        "name": "Fresh green",
        "description": "Lively green with deep blue, petal pink, and mint.",
        "colors": {
          "light": [
            "#00c853",
            "#07376b",
            "#ffb8da",
            "#b6ebd8"
          ],
          "dark": [
            "#00c853",
            "#07376b",
            "#ffb8da",
            "#b6ebd8"
          ]
        },
        "primaryForeground": {
          "light": "neutral-10",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-pine",
        "name": "Pine green",
        "description": "Rich green with lime, honey, and a dark blue anchor.",
        "colors": {
          "light": [
            "#00906c",
            "#abff5a",
            "#ffd56a",
            "#123d5c"
          ],
          "dark": [
            "#00906c",
            "#abff5a",
            "#ffd56a",
            "#123d5c"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-deep-green",
        "name": "Deep green",
        "description": "A dark green base with bright orange, mint, and butter yellow.",
        "colors": {
          "light": [
            "#085e55",
            "#ff5a00",
            "#b6ebd8",
            "#ffed9b"
          ],
          "dark": [
            "#085e55",
            "#ff5a00",
            "#b6ebd8",
            "#ffed9b"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-9"
        }
      },
      {
        "id": "atlas-turquoise",
        "name": "Turquoise",
        "description": "Clear turquoise with dark teal, apricot, and pale aqua.",
        "colors": {
          "light": [
            "#00b7c4",
            "#094b58",
            "#ffb579",
            "#c1f3ed"
          ],
          "dark": [
            "#00b7c4",
            "#094b58",
            "#ffb579",
            "#c1f3ed"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-daybreak",
        "name": "Daybreak",
        "description": "Clear cyan with deep blue, pale lilac, and warm orange.",
        "colors": {
          "light": [
            "#00e1f3",
            "#153d85",
            "#c9b8f5",
            "#ff9800"
          ],
          "dark": [
            "#00e1f3",
            "#153d85",
            "#c9b8f5",
            "#ff9800"
          ]
        },
        "primaryForeground": {
          "light": "neutral-9",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-sky",
        "name": "Sky blue",
        "description": "Fresh sky blue with deep green, butter yellow, and soft coral.",
        "colors": {
          "light": [
            "#00afe8",
            "#085e55",
            "#ffed9b",
            "#ffb5aa"
          ],
          "dark": [
            "#00afe8",
            "#085e55",
            "#ffed9b",
            "#ffb5aa"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-azure",
        "name": "Azure",
        "description": "Bright azure with navy, pale lime, and peach.",
        "colors": {
          "light": [
            "#0088ff",
            "#07376b",
            "#d4f5a4",
            "#ffd0b0"
          ],
          "dark": [
            "#0088ff",
            "#07376b",
            "#d4f5a4",
            "#ffd0b0"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-navy",
        "name": "Navy",
        "description": "Deep navy with vivid orange, clear sky, and pale yellow.",
        "colors": {
          "light": [
            "#07376b",
            "#ff5a00",
            "#87d8f5",
            "#ffed9b"
          ],
          "dark": [
            "#07376b",
            "#ff5a00",
            "#87d8f5",
            "#ffed9b"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-9"
        }
      },
      {
        "id": "atlas-monochrome",
        "name": "Monochrome",
        "description": "Soft black, graphite, silver, and chalk.",
        "colors": {
          "light": [
            "#000000",
            "#626262",
            "#b3b3b3",
            "#e5e5e5"
          ],
          "dark": [
            "#000000",
            "#626262",
            "#b3b3b3",
            "#e5e5e5"
          ]
        },
        "primaryForeground": {
          "light": "neutral-1",
          "dark": "neutral-10"
        }
      },
      {
        "id": "atlas-electric",
        "name": "Electric blue",
        "description": "Vivid blue with candy pink, lime, and inky indigo.",
        "colors": {
          "light": [
            "#5151fc",
            "#ffc0ff",
            "#abff5a",
            "#242866"
          ],
          "dark": [
            "#5151fc",
            "#ffc0ff",
            "#abff5a",
            "#242866"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-9"
        }
      },
      {
        "id": "atlas-open-sky",
        "name": "Open sky",
        "description": "Deep violet with coral, soft lilac, and golden yellow.",
        "colors": {
          "light": [
            "#5100c0",
            "#ff7963",
            "#ceb7f5",
            "#ffd260"
          ],
          "dark": [
            "#5100c0",
            "#ff7963",
            "#ceb7f5",
            "#ffd260"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-9"
        }
      },
      {
        "id": "atlas-lavender",
        "name": "Lavender",
        "description": "Bright lavender with deep plum, butter yellow, and pale mint.",
        "colors": {
          "light": [
            "#a34cf3",
            "#4f206d",
            "#ffed9b",
            "#b6ebd8"
          ],
          "dark": [
            "#a34cf3",
            "#4f206d",
            "#ffed9b",
            "#b6ebd8"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-orchid",
        "name": "Orchid",
        "description": "Electric orchid with deep violet, soft lilac, and lime.",
        "colors": {
          "light": [
            "#e82cf2",
            "#5100c0",
            "#e9d5ff",
            "#abff5a"
          ],
          "dark": [
            "#e82cf2",
            "#5100c0",
            "#e9d5ff",
            "#abff5a"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-futuristic",
        "name": "Futuristic pink",
        "description": "Bright pink balanced by deep green, lavender, and apricot.",
        "colors": {
          "light": [
            "#ff6fff",
            "#085e55",
            "#e9d5ff",
            "#ffce9d"
          ],
          "dark": [
            "#ff6fff",
            "#085e55",
            "#e9d5ff",
            "#ffce9d"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-candy",
        "name": "Candy pink",
        "description": "Soft pink with electric blue, dark berry, and peach.",
        "colors": {
          "light": [
            "#ffc0ff",
            "#5151fc",
            "#79094f",
            "#ffd0b0"
          ],
          "dark": [
            "#ffc0ff",
            "#5151fc",
            "#79094f",
            "#ffd0b0"
          ]
        },
        "primaryForeground": {
          "light": "neutral-9",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-hot-pink",
        "name": "Hot pink",
        "description": "Bold pink with deep green, pale lime, and soft peach.",
        "colors": {
          "light": [
            "#ff2c9c",
            "#085e55",
            "#d4f5a4",
            "#ffd0b0"
          ],
          "dark": [
            "#ff2c9c",
            "#085e55",
            "#d4f5a4",
            "#ffd0b0"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-watermelon",
        "name": "Watermelon",
        "description": "Juicy pink-red with navy, mint, and a pale blush.",
        "colors": {
          "light": [
            "#ff2863",
            "#07376b",
            "#b6ebd8",
            "#ffc5ce"
          ],
          "dark": [
            "#ff2863",
            "#07376b",
            "#b6ebd8",
            "#ffc5ce"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      },
      {
        "id": "atlas-loud",
        "name": "Loud red",
        "description": "A clear red with blush, deep blue, and pale apricot.",
        "colors": {
          "light": [
            "#fc032d",
            "#ffc5ce",
            "#153d85",
            "#ffd7ad"
          ],
          "dark": [
            "#fc032d",
            "#ffc5ce",
            "#153d85",
            "#ffd7ad"
          ]
        },
        "primaryForeground": {
          "light": "neutral-2",
          "dark": "neutral-2"
        }
      }
    ],
    "paletteBaseNeutrals": {
      "light": {
        "neutral-1": "#ffffff",
        "neutral-2": "#fafafa",
        "neutral-3": "#f0f0f0",
        "neutral-4": "#dedede",
        "neutral-5": "#c5c5c5",
        "neutral-6": "#969696",
        "neutral-7": "#6c6c6c",
        "neutral-8": "#454545",
        "neutral-9": "#252525",
        "neutral-10": "#000000"
      },
      "dark": {
        "neutral-1": "#000000",
        "neutral-2": "#202020",
        "neutral-3": "#2b2b2b",
        "neutral-4": "#383838",
        "neutral-5": "#505050",
        "neutral-6": "#777777",
        "neutral-7": "#a3a3a3",
        "neutral-8": "#c6c6c6",
        "neutral-9": "#e5e5e5",
        "neutral-10": "#ffffff"
      }
    },
    "keyColorPalette": [
      "#ff5a00",
      "#ff9800",
      "#cf9148",
      "#d4b441",
      "#ffea00",
      "#abff5a",
      "#6dcc00",
      "#00c853",
      "#00906c",
      "#085e55",
      "#00b7c4",
      "#00e1f3",
      "#00afe8",
      "#0088ff",
      "#07376b",
      "#000000",
      "#5151fc",
      "#5100c0",
      "#a34cf3",
      "#e82cf2",
      "#ff6fff",
      "#ffc0ff",
      "#ff2c9c",
      "#ff2863",
      "#fc032d"
    ]
  },
  "componentTokens": {
    "button:ghost:part:label:rest": {
      "weight": "heavy"
    },
    "button:danger:part:label:rest": {
      "weight": "heavy"
    },
    "field:default:part:label:rest": {
      "weight": "heavy"
    },
    "button:ghost:part:control:rest": {
      "paddingX": "m",
      "paddingTop": "s",
      "paddingLeft": "m",
      "paddingRight": "m",
      "paddingBottom": "s"
    },
    "button:outline:part:label:rest": {
      "weight": "heavy"
    },
    "button:primary:part:label:rest": {
      "weight": "heavy"
    },
    "button:danger:part:control:rest": {
      "paddingX": "m",
      "paddingTop": "s",
      "paddingLeft": "m",
      "paddingRight": "m",
      "paddingBottom": "s"
    },
    "button:ghost:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "button:ghost:part:control:hover": {
      "background": "neutral-4"
    },
    "input:default:part:control:rest": {
      "paddingX": "s",
      "textSize": "m",
      "lineHeight": "s",
      "paddingTop": "s",
      "borderColor": "neutral-6",
      "paddingLeft": "s",
      "paddingRight": "s",
      "paddingBottom": "s"
    },
    "slider:default:part:thumb:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "tabs:default:part:trigger:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "button:danger:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "button:danger:part:control:hover": {
      "background": "color-7"
    },
    "button:outline:part:control:rest": {
      "paddingX": "m",
      "paddingTop": "s",
      "borderColor": "neutral-6",
      "paddingLeft": "m",
      "paddingRight": "m",
      "paddingBottom": "s"
    },
    "button:primary:part:control:rest": {
      "paddingX": "l",
      "paddingTop": "s",
      "paddingLeft": "l",
      "paddingRight": "l",
      "paddingBottom": "s"
    },
    "button:secondary:part:label:rest": {
      "weight": "heavy"
    },
    "input:default:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "input:default:part:control:hover": {
      "borderColor": "neutral-8"
    },
    "radio:default:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "switch:default:part:control:rest": {
      "background": "neutral-6"
    },
    "button:outline:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      },
      "borderColor": "neutral-6"
    },
    "button:outline:part:control:hover": {
      "borderColor": "neutral-8"
    },
    "button:primary:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "button:primary:part:control:hover": {
      "background": "color-6"
    },
    "combobox:default:part:input:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "select:default:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "switch:default:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "toggle:default:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "button:secondary:part:control:rest": {
      "paddingX": "m",
      "paddingTop": "s",
      "borderColor": "neutral-6",
      "paddingLeft": "m",
      "paddingRight": "m",
      "paddingBottom": "s"
    },
    "checkbox:default:part:control:rest": {
      "borderColor": "neutral-6",
      "controlSize": "m"
    },
    "menubar:default:part:trigger:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "otp-field:default:part:input:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "button:secondary:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      },
      "borderColor": "neutral-6"
    },
    "button:secondary:part:control:hover": {
      "background": "neutral-4",
      "borderColor": "neutral-8"
    },
    "checkbox:default:part:control:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "accordion:default:part:trigger:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "autocomplete:default:part:input:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "collapsible:default:part:trigger:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "preview-card:default:part:trigger:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "number-field:default:part:decrement:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "number-field:default:part:increment:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    },
    "navigation-menu:default:part:trigger:focus": {
      "focusRing": {
        "color": "color-5",
        "width": 2,
        "opacity": 100
      }
    }
  },
  "componentVariants": {}
};
