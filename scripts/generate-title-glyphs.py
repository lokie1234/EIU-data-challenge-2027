"""Subset the locally licensed Space Grotesk outlines for the 3D title.

Run from the project root with Python/fontTools; no network or runtime font parser.
"""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen

ROOT = Path(__file__).resolve().parents[1]
font = TTFont(ROOT / "public/fonts/space-grotesk.ttf")
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()


class OutlinePen(BasePen):
    def __init__(self):
        super().__init__(glyph_set)
        self.commands = []

    def add(self, op, *points):
        self.commands.append([op, *[round(v, 3) for p in points for v in p]])

    def _moveTo(self, p): self.add("m", p)
    def _lineTo(self, p): self.add("l", p)
    def _qCurveToOne(self, c, p): self.add("q", c, p)
    def _curveToOne(self, a, b, p): self.add("c", a, b, p)
    def _closePath(self): self.commands.append(["z"])


glyphs = {}
for character in sorted(set("EIU Data Challenge 2027")):
    name = cmap[ord(character)]
    pen = OutlinePen()
    glyph_set[name].draw(pen)
    glyphs[character] = {"advance": font["hmtx"][name][0], "commands": pen.commands}

output = {"family": "Space Grotesk", "source": "public/fonts/space-grotesk.ttf", "unitsPerEm": font["head"].unitsPerEm, "glyphs": glyphs}
(ROOT / "components/three/studio/titleGlyphs.json").write_text(json.dumps(output, separators=(",", ":")), encoding="utf-8")
