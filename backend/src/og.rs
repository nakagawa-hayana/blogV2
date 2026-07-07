use std::sync::Arc;

use tiny_skia::Pixmap;
use usvg::{fontdb, Options, Tree};

const FONT_BYTES: &[u8] = include_bytes!("../assets/fonts/ZenMaruGothic-Bold.ttf");
const FONT_FAMILY: &str = "Zen Maru Gothic";

pub const OG_WIDTH: u32 = 1200;
pub const OG_HEIGHT: u32 = 630;

fn build_fontdb() -> fontdb::Database {
    let mut db = fontdb::Database::new();
    db.load_font_data(FONT_BYTES.to_vec());
    db
}

fn pick_title_size(title: &str) -> u32 {
    let len = title.chars().count();
    if len <= 18 {
        78
    } else if len <= 28 {
        68
    } else if len <= 40 {
        58
    } else {
        50
    }
}

fn wrap_title(title: &str, per_line: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut current = String::new();
    let mut count = 0usize;
    for ch in title.chars() {
        current.push(ch);
        count += 1;
        if count >= per_line {
            lines.push(std::mem::take(&mut current));
            count = 0;
        }
    }
    if !current.is_empty() {
        lines.push(current);
    }
    if lines.is_empty() {
        lines.push(String::new());
    }
    lines
}

fn per_line_for(size: u32) -> usize {
    match size {
        78 => 12,
        68 => 14,
        58 => 17,
        _ => 20,
    }
}

fn build_svg(title: &str) -> String {
    let size = pick_title_size(title);
    let per_line = per_line_for(size);
    let lines = wrap_title(title, per_line);

    let line_height = (size as f32 * 1.35) as i32;
    let block_height = line_height * lines.len() as i32;
    let start_y = (OG_HEIGHT as i32 - block_height) / 2 + size as i32;

    let mut tspans = String::new();
    for (i, line) in lines.iter().enumerate() {
        let y = start_y + (i as i32) * line_height;
        tspans.push_str(&format!(
            r##"<text x="84" y="{y}" font-family="{ff}" font-size="{size}" font-weight="700" fill="#524852" letter-spacing="1.5">{esc}</text>"##,
            y = y,
            size = size,
            esc = html_escape::encode_text(line),
            ff = FONT_FAMILY,
        ));
    }

    format!(
        r###"<svg width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="{w}" height="{h}" fill="#fbf4f4"/>
<rect x="5" y="5" width="{rw}" height="{rh}" fill="none" stroke="#e9b8cb" stroke-width="10"/>
<circle cx="103" cy="103" r="9" fill="#e9b8cb"/>
{tspans}
<text x="84" y="551" font-family="{ff}" font-size="26" font-weight="700" fill="#c26e8c">ardririyの足跡</text>
<circle cx="1088" cy="543" r="7" fill="#e9b8cb"/>
<circle cx="1112" cy="543" r="7" fill="#b7a7de"/>
<circle cx="1136" cy="543" r="7" fill="#f7e4ea"/>
</svg>"###,
        w = OG_WIDTH,
        h = OG_HEIGHT,
        rw = OG_WIDTH - 10,
        rh = OG_HEIGHT - 10,
        tspans = tspans,
        ff = FONT_FAMILY,
    )
}

pub fn render_png(title: &str) -> Result<Vec<u8>, String> {
    let svg = build_svg(title);
    let mut opts = Options::default();
    opts.fontdb = Arc::new(build_fontdb());
    opts.font_family = FONT_FAMILY.to_string();
    let tree = Tree::from_str(&svg, &opts).map_err(|e| format!("usvg parse: {e}"))?;
    let mut pixmap = Pixmap::new(OG_WIDTH, OG_HEIGHT).ok_or("pixmap alloc failed")?;
    resvg::render(
        &tree,
        tiny_skia::Transform::default(),
        &mut pixmap.as_mut(),
    );
    pixmap.encode_png().map_err(|e| format!("png encode: {e}"))
}
