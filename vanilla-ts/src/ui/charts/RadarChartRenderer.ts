export type RadarData = {
    [key: string]: number; // key: label, value: 0-100
};

export class RadarChartRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private labels: string[];
    private data: RadarData;
    private maxVal: number = 100;
    private padding: number = 40;

    constructor(canvas: HTMLCanvasElement, labels: string[]) {
        this.ctx = canvas.getContext('2d')!;
        this.width = canvas.width;
        this.height = canvas.height;
        this.labels = labels;
        this.data = {};

        // High DPI fix
        const dpr = window.devicePixelRatio || 1;
        canvas.width = this.width * dpr;
        canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
        canvas.style.width = `${this.width}px`;
        canvas.style.height = `${this.height}px`;
    }

    public draw(data: RadarData) {
        this.data = data;
        this.ctx.clearRect(0, 0, this.width, this.height);

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(centerX, centerY) - this.padding;

        // Draw Background Grid
        this.drawGrid(centerX, centerY, radius);

        // Draw Data Blob
        this.drawData(centerX, centerY, radius);

        // Draw Labels
        this.drawLabels(centerX, centerY, radius);
    }

    private drawGrid(cx: number, cy: number, r: number) {
        const totalAxes = this.labels.length;
        const ctx = this.ctx;

        // Circles (Concentric)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        const steps = 4; // 25, 50, 75, 100

        for (let i = 1; i <= steps; i++) {
            ctx.beginPath();
            const curR = r * (i / steps);
            // Draw polygon instead of circle for 'tech' feel
            for (let j = 0; j < totalAxes; j++) {
                const angle = (Math.PI * 2 * j) / totalAxes - Math.PI / 2;
                const x = cx + Math.cos(angle) * curR;
                const y = cy + Math.sin(angle) * curR;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Axes lines
        for (let i = 0; i < totalAxes; i++) {
            const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            ctx.stroke();
        }
    }

    private drawData(cx: number, cy: number, r: number) {
        const totalAxes = this.labels.length;
        const ctx = this.ctx;

        ctx.beginPath();
        ctx.fillStyle = "rgba(88, 166, 255, 0.4)"; // Primary color semi-transparent
        ctx.strokeStyle = "#58a6ff";
        ctx.lineWidth = 2;

        this.labels.forEach((label, i) => {
            const val = this.data[label] || 0;
            const normalized = Math.min(val, this.maxVal) / this.maxVal; // 0..1
            const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;

            // Add a small base radius so explicit 0 shows up as a tiny dot or distinct from center
            const drawR = r * normalized;

            const x = cx + Math.cos(angle) * drawR;
            const y = cy + Math.sin(angle) * drawR;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw Dots
        this.labels.forEach((label, i) => {
            const val = this.data[label] || 0;
            const normalized = Math.min(val, this.maxVal) / this.maxVal;
            const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
            const drawR = r * normalized;
            const x = cx + Math.cos(angle) * drawR;
            const y = cy + Math.sin(angle) * drawR;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
        });
    }

    private drawLabels(cx: number, cy: number, r: number) {
        const totalAxes = this.labels.length;
        const ctx = this.ctx;
        ctx.fillStyle = "#8b949e"; // Muted text
        ctx.font = "12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        this.labels.forEach((label, i) => {
            const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
            const labelR = r + 20; // Padding
            const x = cx + Math.cos(angle) * labelR;
            const y = cy + Math.sin(angle) * labelR;

            // Capitalize
            const text = label.charAt(0).toUpperCase() + label.slice(1);
            ctx.fillText(text, x, y);
        });
    }
}
