# Screenshot checklist: YouTube clip → PowerPoint on iPad

Guide: `general/YouTube-Clip-in-PowerPoint-iPad.html`

Nine numbered placeholders are already positioned in the bilingual guide. Capture on the actual school iPad so the instructions can be aligned with its iPadOS and PowerPoint versions. Screenshots 04 and 09 illustrate optional steps.

## Before capturing

- Use landscape orientation and a permitted demonstration video. Prefer your own or appropriately licensed material.
- Hide notifications and account names. Do not show student data, private browser tabs, or a personal Photos library. Use a clean demo library or crop/blur private details.
- German interface screenshots are fine for both languages: the guide has German and English captions. English variants can be added later if wanted.
- Capture screenshots, not photographs of the screen. Keep menu labels readable; add simple arrows or outlines if helpful.
- Confirm the recorded clip actually contains the intended picture and audio, then verify insertion and playback in the native PowerPoint app. A screenshot alone cannot verify audio or offline playback.
- Note the iPadOS and PowerPoint versions used. If a control has moved or a label differs, update the guide to match the tested device rather than forcing the screenshot to match the draft.

## Capture list

| # | Suggested filename | Screen to capture / what to highlight |
|---|---|---|
| 01 | `01-mikrofon-aus.png` | Control Center with Screen Recording expanded after a long press. Show **Microphone Off / Mikrofon aus** and **Start Recording / Aufnahme starten**. |
| 02 | `02-aufnahme-stoppen.png` | During recording, tap the red status indicator. Show the **Stop / Stopp** confirmation. If the actual iPad only offers stopping through Control Center, capture that and adjust the caption/instructions. |
| 03 | `03-video-kuerzen.png` | Photos → Edit → video timeline. Show **both yellow trim handles** and **Play**. Select the intended roughly 20-second excerpt. |
| 04 (optional step) | `04-bild-zuschneiden.png` | Photos crop tool. Show the **Crop icon** and crop frame around the video picture, excluding unwanted YouTube interface. Keep relevant subtitles/content visible. |
| 05 | `05-neuen-clip-sichern.png` | After tapping Done, show **Save Video as New Clip / Video als neuen Clip sichern**. If unavailable in this version, record the actual save workflow so the text can be adjusted. |
| 06 | `06-video-einfuegen.png` | Native PowerPoint iPad app with a slide selected and **Insert / Einfügen → Videos / Video** visible. Include the Photos/library choice if the menu shows one. |
| 07 | `07-kurzen-clip-waehlen.png` | PowerPoint's video/library picker with the **short clip selected**, its duration if visible, and Insert/checkmark if offered. Hide all unrelated private thumbnails. |
| 08 | `08-wiedergabe-testen.png` | Actual **Slide Show** mode with the inserted clip and its **Play control** visible, plus the source credit on the slide. Test sound and offline playback separately. |
| 09 (optional step) | `09-kleines-video.png` | Example slide with a **small but easily tappable video** in a corner, labelled “Musik abspielen” / “Play music”. Do not cover its Play control with another image. |

## Add the images later

Save files beside this checklist in `general/images/powerpoint-ipad/`. Each HTML placeholder has a matching `id="screenshot-01"` … `screenshot-09` and a comment containing the intended filename.

Replace only the placeholder paragraph with the real image and change the figure's class from `screenshot-placeholder` to `guide-screenshot`. Keep the bilingual `figcaption`. Add the image's actual width and height and meaningful alt text; the existing General language script supports `data-alt-de` and `data-alt-en`.

Example (dimensions must match the actual image):

```html
<figure class="guide-screenshot" id="screenshot-01">
  <img class="screenshot" src="images/powerpoint-ipad/01-mikrofon-aus.png"
       alt="Bildschirmaufnahme: Mikrofon aus und Aufnahme starten."
       data-alt-de="Bildschirmaufnahme: Mikrofon aus und Aufnahme starten."
       data-alt-en="Screen Recording: Microphone Off and Start Recording."
       loading="lazy">
  <figcaption><!-- keep the existing German and English captions --></figcaption>
</figure>
```

After replacing placeholders, check both languages, the iPad-width layout, and print preview. Update the wording if the real device differs. Do not commit private screenshots.
