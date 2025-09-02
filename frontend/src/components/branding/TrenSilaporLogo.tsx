"use client";

import * as React from "react";
import clsx from "clsx";

/**
 * TrenSilaporLogo
 * A reusable SVG logo component for the TrenSilapor dashboard.
 * Design language:
 *  - Shield motif (pengawasan / protection) + chart bars (tren) + eye arc (transparency) + check (integritas)
 *  - Color palette aligns with existing gradients (red ➜ blue) and supervisory green accent
 * Props allow sizing and text inclusion for flexible placement.
 */
export interface TrenSilaporLogoProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Tinggi dasar ikon / wordmark (px). */
	size?: number;
	/**
	 * Varian:
	 * - full: shield + wordmark (default lama)
	 * - icon: hanya shield
	 * - mono: shield monokrom
	 * - wordmark: hanya teks profesional (wordmark baru)
	 * - pro: versi baru (shield refined + wordmark baru + layout seimbang)
	 */
	variant?: "full" | "icon" | "mono" | "wordmark" | "pro";
	withText?: boolean;
	textClassName?: string;
	iconClassName?: string;
	animate?: boolean;
	showMeaning?: boolean;
	/** Paksa fallback <img src="/logo.png"/> jika perlu (misal untuk email). */
	rasterFallback?: boolean;
	/** Tampilkan animasi tren (bars naik). */
	emphasizeTrend?: boolean;
}

/**
 * Arti / Makna Elemen Logo TrenSilapor (Orange + Gray Brand Variant)
 * - Perisai (Shield): Perlindungan & independensi pengawasan.
 * - Batang Tren Meningkat: Kecerdasan data & perbaikan berkelanjutan.
 * - Lengkung Mata: Transparansi & keterbukaan informasi publik.
 * - Tanda Centang: Integritas, validasi, dan kepatuhan regulasi.
 * - Palet Oranye → Energi, kewaspadaan, semangat partisipatif.
 * - Palet Abu-abu → Stabilitas, netralitas, objektivitas dalam pengawasan.
 */
export const TREN_SILAPOR_LOGO_MEANING: { key: string; label: string; description: string }[] = [
	{
		key: "shield",
		label: "Perisai",
		description: "Perlindungan integritas dan kemandirian fungsi pengawasan."
	},
	{
		key: "bars",
		label: "Batang Tren",
		description: "Representasi analitik data yang naik (evidence-based monitoring)."
	},
	{
		key: "eyeArc",
		label: "Lengkung Mata",
		description: "Transparansi proses & visibilitas publik."
	},
	{
		key: "check",
		label: "Tanda Centang",
		description: "Integritas, akurasi, dan konfirmasi kepatuhan."
	},
	{
		key: "paletteOrange",
		label: "Oranye",
		description: "Energi, kewaspadaan, kolaborasi masyarakat."
	},
	{
		key: "paletteGray",
		label: "Abu-abu",
		description: "Netral, seimbang, objektif (tidak memihak)."
	}
];

const DEFAULT_SIZE = 64; // perbesar default agar tampil lebih dominan

export const TrenSilaporLogo: React.FC<TrenSilaporLogoProps> = ({
	size = DEFAULT_SIZE,
	variant = "full",
	withText,
	className,
	textClassName,
	iconClassName,
	animate = false,
	...rest
}) => {
		const showText = withText ?? (variant !== "icon" && variant !== "wordmark");
		const isMono = variant === "mono";
		const wordmarkOnly = variant === "wordmark";
		const pro = variant === "pro";
		const effectiveSize = size;

	return (

		<div
			className={clsx(
				"flex items-center select-none",
				pro ? "gap-4" : "gap-3",
				wordmarkOnly && "gap-0",
				className
			)}
			style={{ lineHeight: 1 }}
			{...rest}
		>
				{!wordmarkOnly && (
				<div
					aria-hidden
					className={clsx(
							"relative inline-flex items-center justify-center rounded-2xl overflow-hidden",
						isMono && "bg-gray-900 dark:bg-gray-700",
							!isMono && !pro && "bg-gradient-to-br from-orange-600 via-orange-500 to-gray-800",
							pro && !isMono && "bg-gradient-to-br from-orange-500 via-orange-400 to-gray-900",
							animate && "ring-1 ring-black/5 dark:ring-white/5 shadow-sm transition-all duration-700"
					)}
						style={{ width: effectiveSize, height: effectiveSize }}
				>
					<svg
						className={clsx(
								"block transition-transform duration-700 will-change-transform",
								(rest as any).emphasizeTrend && animate && "hover:scale-[1.04]",
							iconClassName
						)}
							width={Math.round(effectiveSize * 0.82)}
							height={Math.round(effectiveSize * 0.82)}
						viewBox="0 0 64 64"
						fill="none"
						role="img"
					>
						<title>TrenSilapor</title>
							<defs>
								<linearGradient id="shieldFill" x1="14" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
									<stop offset="0%" stopColor={isMono ? '#1f2937' : '#ffffff'} stopOpacity={isMono ? 0.9 : 0.96} />
									<stop offset="70%" stopColor={isMono ? '#374151' : '#f5f5f5'} stopOpacity={isMono ? 0.95 : 0.9} />
									<stop offset="100%" stopColor={isMono ? '#4b5563' : '#ffffff'} stopOpacity={isMono ? 0.9 : 0.85} />
								</linearGradient>
								<linearGradient id="barOrange" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
									<stop offset="0%" stopColor="#ffb259" />
									<stop offset="100%" stopColor="#f97316" />
								</linearGradient>
								<filter id="innerShadow" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
									<feOffset dx="0" dy="1" />
									<feGaussianBlur stdDeviation="1.2" result="blur" />
									<feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="-1" k3="1" />
									<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
								</filter>
								<filter id="checkShadow" x="0" y="0" width="200%" height="200%" colorInterpolationFilters="sRGB">
									<feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.35" />
								</filter>
								<linearGradient id="arcGrad" x1="18" y1="22" x2="46" y2="30" gradientUnits="userSpaceOnUse">
									<stop offset="0%" stopColor="#fb923c" />
									<stop offset="100%" stopColor="#f97316" />
								</linearGradient>
							</defs>
							{/* Shield refined */}
							<path
								d="M32 5.2 10 12.8v17.1c0 17.6 11.6 28.3 22 31.9 10.4-3.6 22-14.3 22-31.9V12.8L32 5.2Z"
								fill="url(#shieldFill)"
								shapeRendering="geometricPrecision"
							/>
							{/* Subtle contour */}
							<path
								d="M32 5.2 10 12.8v17.1c0 17.6 11.6 28.3 22 31.9"
								stroke={isMono ? '#ffffff10' : '#00000018'}
								strokeWidth={2}
								strokeLinecap="round"
							/>
							{/* Trend Bars */}
							<rect x={20} y={34} width={6} height={12} rx={1.4} fill={isMono ? '#6b7280' : '#9ca3af'} />
							<rect x={29} y={28} width={6} height={18} rx={1.4} fill={isMono ? '#81868f' : 'url(#barOrange)'} />
							<rect x={38} y={20} width={6} height={26} rx={1.4} fill={isMono ? '#9ca3af' : '#f97316'} />
							{/* Eye Arc */}
							<path
								d="M18.4 30c3.9-5.4 9-8.2 13.6-8.2S41.1 24.6 45 30"
								stroke="url(#arcGrad)"
								strokeWidth={2.4}
								strokeLinecap="round"
								strokeLinejoin="round"
								filter="url(#innerShadow)"
							/>
							{/* Check Mark */}
							<path
								d="M27 34.5 31 38l7-8"
								stroke={isMono ? '#374151' : '#374151'}
								strokeWidth={2.7}
								strokeLinecap="round"
								strokeLinejoin="round"
								filter="url(#checkShadow)"
							/>
							{/* Light gloss */}
							{!isMono && (
								<path
									d="M32 5.2 10 12.8v2.6l22-6.5 22 6.5v-2.6L32 5.2Z"
									fill="#ffffff"
									opacity={0.28}
								/>
							)}
					</svg>
						{/* ambient radial fade */}
						{!isMono && (
							<div className="pointer-events-none absolute inset-0">
								<div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.9),rgba(255,255,255,0)_60%)]" />
								<div className="absolute inset-0 ring-1 ring-white/40 dark:ring-white/10 rounded-2xl" />
							</div>
						)}
				</div>
			)}

			{/* WORDMARK / BRAND TEXT */}
			{(showText || wordmarkOnly || pro) && (
				<div className={clsx("flex flex-col", textClassName)}>
							<div className="flex items-baseline gap-1 leading-none select-none">
						<span
							className={clsx(
								"font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-gray-700",
										effectiveSize >= 96 ? "text-6xl" : effectiveSize >= 90 ? "text-5xl" : effectiveSize >= 80 ? "text-4xl" : effectiveSize >= 72 ? "text-[38px]" : effectiveSize >= 64 ? "text-[32px]" : effectiveSize >= 56 ? "text-[30px]" : effectiveSize >= 48 ? "text-2xl" : "text-xl"
							)}
							style={{ letterSpacing: '-0.02em' }}
						>
							Tren
						</span>
						<span
							className={clsx(
								"font-light text-gray-400 dark:text-gray-500",
										effectiveSize >= 64 ? "text-3xl" : effectiveSize >= 56 ? "text-2xl" : effectiveSize >= 48 ? "text-xl" : "text-lg"
							)}
						>
							–
						</span>
						<span
							className={clsx(
								"font-semibold tracking-tight text-gray-800 dark:text-gray-100",
										effectiveSize >= 96 ? "text-6xl" : effectiveSize >= 90 ? "text-5xl" : effectiveSize >= 80 ? "text-4xl" : effectiveSize >= 72 ? "text-[38px]" : effectiveSize >= 64 ? "text-[32px]" : effectiveSize >= 56 ? "text-[30px]" : effectiveSize >= 48 ? "text-2xl" : "text-xl"
							)}
							style={{ letterSpacing: '-0.01em' }}
						>
							Silapor
						</span>
					</div>
							{/* Tagline dihapus sesuai permintaan */}
					{rest && (rest as any).showMeaning && (
						<ul className="mt-2 space-y-0.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 list-disc pl-4 max-w-xs">
							{TREN_SILAPOR_LOGO_MEANING.slice(0,4).map(item => (
								<li key={item.key}>
									<span className="font-medium">{item.label}:</span> {item.description}
								</li>
							))}
						</ul>
					)}
				</div>
			)}
			{/* Raster Fallback if requested */}
			{rest && (rest as any).rasterFallback && (
				<img
					src="/logo.png"
					alt="TrenSilapor"
					className="ml-4 h-auto object-contain"
					style={{ height: size * 0.9 }}
				/>
			)}
		</div>
	);
};

export default TrenSilaporLogo;

