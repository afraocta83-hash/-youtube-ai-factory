from manim import *

class ManimSmoke(Scene):
    def construct(self):
        title = Text("Lerry STEM test", font_size=28)
        circle = Circle(radius=0.8, color=BLUE).set_fill(BLUE, opacity=0.35)
        square = Square(side_length=1.5, color=ORANGE).set_fill(ORANGE, opacity=0.35)
        self.play(FadeIn(title), run_time=0.5)
        self.play(title.animate.to_edge(UP), Create(circle), run_time=0.8)
        self.play(Transform(circle, square), run_time=0.8)
        self.wait(0.4)
