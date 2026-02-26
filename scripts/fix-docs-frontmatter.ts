import fs from "node:fs"
import path from "node:path"

const docsDir = path.join(process.cwd(), "docs")

function fixFrontmatter() {
    console.log(`Scanning ${docsDir}...`)
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith(".md"))

    files.forEach(file => {
        const filePath = path.join(docsDir, file)
        let content = fs.readFileSync(filePath, "utf-8")

        // Check if frontmatter exists
        if (content.startsWith("---")) {
            console.log(`Skipping ${file} - already has frontmatter`)
            return
        }

        // Extract title from first line (# Title)
        const titleMatch = content.match(/^# (.*)/)
        let title = file.replace(".md", "")
        let description = "Kitchen-OS Documentation"

        if (titleMatch) {
            title = titleMatch[1].trim()
            // Remove the title line from content to avoid duplication
            content = content.replace(/^# .*\n+/, "")
        }

        const newContent = `---
title: ${title}
description: ${description}
---

${content}`

        fs.writeFileSync(filePath, newContent)
        console.log(`Fixed ${file}`)
    })
}

fixFrontmatter()
