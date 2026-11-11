def build_recommendations(room_category: str, style: str, background_color: str, foreground_color: str, instructions: str = "") -> str:
    room = room_category or "living room"
    palette = {
        "background": background_color or "#F5F1EB",
        "foreground": foreground_color or "#1F2937",
    }
    style_name = (style or "Modern").strip()
    notes = instructions.strip() or "Keep the room airy, functional, and visually balanced."

    return f"""# Interior Recommendations

## Overview
- Room type: **{room.title()}**
- Style direction: **{style_name}**
- Palette: **{palette['background']}** background / **{palette['foreground']}** accent
- Design brief: {notes}

## Layout guidance
- Keep a clear circulation path and preserve natural light where possible.
- Group furniture around a focal point such as the bed, sofa, or dining table.
- Use modular pieces and concealed storage to keep the room uncluttered.

## Furniture suggestions
- Add a versatile {style_name.lower()} accent chair, a low-profile side table, and layered textiles with soft textures.
- Use built-in storage, floating shelves, and compact furniture for better space efficiency.
- Prioritize comfort and proportion over excessive decor.

## Lighting and color
- Blend warm lighting with the selected palette for a welcoming mood.
- Introduce layered lighting with ambient, task, and accent sources.
- Keep the wall finishes calm and neutral to enhance the chosen accent tones.

## Final design notes
- Maintain proportion, contrast, and simplicity to achieve a polished {style_name.lower()} interior.
- Optimize storage and open surfaces to make the room feel larger and more organized.
"""
