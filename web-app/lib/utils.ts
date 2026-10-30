import { createCn } from "cn/config"

// Class merging that knows the type roles (text-label, text-caption, ...) are font sizes.
// Without this, merging "text-label text-primary-foreground" would drop text-label, because
// an unknown text-* class looks like a text color. The role names are the --text-* keys in app/globals.css.
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "body",
            "body-strong",
            "label",
            "caption",
            "detail",
          ],
        },
      ],
    },
  },
})
