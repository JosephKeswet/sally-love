"use client";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Image from "next/image";
import React from "react";

export default function Home() {
	const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
	const [yesClicked, setYesClicked] = useState(false);
	const [isNoHovered, setIsNoHovered] = useState(false);
	const [showGallery, setShowGallery] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [hearts, setHearts] = useState([]);
	const [hoverHearts, setHoverHearts] = useState([]);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [glitterTrail, setGlitterTrail] = useState([]);
	const [sparkles, setSparkles] = useState([]);
	const [isPlaying, setIsPlaying] = useState(false);
	const [audioVolume, setAudioVolume] = useState(0.3);
	const [showMusicNotification, setShowMusicNotification] = useState(false);
	const [audioFileExists, setAudioFileExists] = useState(true);
	const [autoplayAttempting, setAutoplayAttempting] = useState(false);

	// Audio ref
	const audioRef = React.useRef(null);
	const playButtonRef = React.useRef(null);

	useEffect(() => {
		// Show gallery after a short delay for smooth animation
		const timer = setTimeout(() => setShowGallery(true), 500);
		return () => clearTimeout(timer);
	}, []);

	// Simulate click on play button when page mounts
	useEffect(() => {
		const timer = setTimeout(() => {
			if (playButtonRef.current && audioFileExists) {
				playButtonRef.current.click();
			}
		}, 1000); // Wait 1 second for everything to load

		return () => clearTimeout(timer);
	}, [audioFileExists]);

	// Audio controls
	const toggleAudio = () => {
		if (audioRef.current) {
			// Check if audio file exists
			if (!audioFileExists) {
				alert(
					"🎵 Please add the song 'Ceilings' by Lizzy McAlpine to public/assets/ceilings-lizzy-mcalpine.mp3"
				);
				return;
			}

			if (isPlaying) {
				audioRef.current.pause();
				// isPlaying will be set to false by the pause event listener
			} else {
				audioRef.current.play().catch((error) => {
					console.log("Audio play failed:", error);
					setAudioFileExists(false);
					alert(
						"🎵 Please add the song 'Ceilings' by Lizzy McAlpine to public/assets/ceilings-lizzy-mcalpine.mp3"
					);
				});
				// isPlaying will be set to true by the play event listener
			}
		}
	};

	const handleVolumeChange = (e) => {
		const volume = parseFloat(e.target.value);
		setAudioVolume(volume);
		if (audioRef.current) {
			audioRef.current.volume = volume;
		}
	};

	// Auto-play music when component mounts (with user interaction)
	useEffect(() => {
		// Since autoPlay is set to true, we need to handle the audio state
		if (audioRef.current && audioFileExists) {
			// Listen for when audio starts playing
			const handlePlay = () => {
				setIsPlaying(true);
				setAutoplayAttempting(false);
				setShowMusicNotification(true);
				setTimeout(() => setShowMusicNotification(false), 3000);
			};

			// Listen for when audio fails to play
			const handleError = () => {
				setAutoplayAttempting(false);
				setAudioFileExists(false);
				console.log("Audio failed to load or play");
			};

			// Listen for when audio is paused
			const handlePause = () => {
				setIsPlaying(false);
			};

			// Add event listeners
			audioRef.current.addEventListener("play", handlePlay);
			audioRef.current.addEventListener("error", handleError);
			audioRef.current.addEventListener("pause", handlePause);

			// Check if audio is already playing (autoplay might have started)
			if (audioRef.current.readyState >= 2) {
				// HAVE_CURRENT_DATA or higher
				setAutoplayAttempting(true);
				// Give it a moment to start playing
				setTimeout(() => {
					if (audioRef.current && !audioRef.current.paused) {
						handlePlay();
					} else {
						setAutoplayAttempting(false);
						// Fallback to user interaction
						setupUserInteractionAutoplay();
					}
				}, 1000);
			}

			// Cleanup event listeners
			return () => {
				if (audioRef.current) {
					audioRef.current.removeEventListener("play", handlePlay);
					audioRef.current.removeEventListener("error", handleError);
					audioRef.current.removeEventListener("pause", handlePause);
				}
			};
		}
	}, [audioFileExists]);

	// Setup user interaction autoplay fallback
	const setupUserInteractionAutoplay = () => {
		const handleFirstInteraction = () => {
			if (audioRef.current && !isPlaying && audioFileExists) {
				audioRef.current.play().catch((error) => {
					console.log("Audio play failed:", error);
					setAudioFileExists(false);
				});
				setIsPlaying(true);
				setShowMusicNotification(true);
				setTimeout(() => setShowMusicNotification(false), 3000);
				document.removeEventListener("click", handleFirstInteraction);
				document.removeEventListener("touchstart", handleFirstInteraction);
				document.removeEventListener("keydown", handleFirstInteraction);
			}
		};

		document.addEventListener("click", handleFirstInteraction);
		document.addEventListener("touchstart", handleFirstInteraction);
		document.addEventListener("keydown", handleFirstInteraction);

		return () => {
			document.removeEventListener("click", handleFirstInteraction);
			document.removeEventListener("touchstart", handleFirstInteraction);
			document.removeEventListener("keydown", handleFirstInteraction);
		};
	};

	// Handle window resize to keep No button within bounds
	useEffect(() => {
		const handleResize = () => {
			if (noButtonPosition.x > 0 || noButtonPosition.y > 0) {
				const buttonWidth = 200;
				const buttonHeight = 100;
				const padding = 20;

				const maxX = window.innerWidth - buttonWidth - padding;
				const maxY = window.innerHeight - buttonHeight - padding;

				const newX = Math.max(padding, Math.min(maxX, noButtonPosition.x));
				const newY = Math.max(padding, Math.min(maxY, noButtonPosition.y));

				if (newX !== noButtonPosition.x || newY !== noButtonPosition.y) {
					setNoButtonPosition({ x: newX, y: newY });
				}
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [noButtonPosition]);

	// Generate floating hearts
	useEffect(() => {
		const generateHeart = () => {
			const heart = {
				id: Date.now() + Math.random(),
				x: Math.random() * window.innerWidth,
				y: window.innerHeight + 50,
				size: Math.random() * 20 + 10,
				speed: Math.random() * 2 + 1,
				rotation: Math.random() * 360,
			};
			setHearts((prev) => [...prev, heart]);

			// Remove heart after animation
			setTimeout(() => {
				setHearts((prev) => prev.filter((h) => h.id !== heart.id));
			}, 8000);
		};

		const interval = setInterval(generateHeart, 2000); // Reduced frequency - every 2 seconds
		return () => clearInterval(interval);
	}, []);

	// Generate hearts on image hover
	const generateHoverHearts = (event) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const hearts = [];

		for (let i = 0; i < 8; i++) {
			// Generate 8 hearts per hover
			const heart = {
				id: Date.now() + Math.random() + i,
				x: rect.left + Math.random() * rect.width,
				y: rect.top + Math.random() * rect.height,
				size: Math.random() * 15 + 8,
				speed: Math.random() * 3 + 2,
				rotation: Math.random() * 360,
				startY: rect.top + Math.random() * rect.height,
			};
			hearts.push(heart);
		}

		setHoverHearts((prev) => [...prev, ...hearts]);

		// Remove hearts after animation
		setTimeout(() => {
			setHoverHearts((prev) =>
				prev.filter((h) => !hearts.find((heart) => heart.id === h.id))
			);
		}, 3000);
	};

	// Close modal when Escape key is pressed
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === "Escape") {
				closeModal();
			}
		};

		if (isModalOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden"; // Prevent background scroll
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isModalOpen]);

	const moveNoButton = () => {
		const buttonWidth = 200;
		const buttonHeight = 100;
		const padding = 20;

		const maxX = window.innerWidth - buttonWidth - padding;
		const maxY = window.innerHeight - buttonHeight - padding;

		const x = Math.max(padding, Math.min(maxX, Math.random() * maxX));
		const y = Math.max(padding, Math.min(maxY, Math.random() * maxY));

		setNoButtonPosition({ x, y });
	};

	const handleYesClick = () => {
		setYesClicked(true);
		// Enhanced confetti with more colors and effects
		confetti({
			particleCount: 150,
			spread: 100,
			origin: { y: 0.6 },
			colors: ["#ff69b4", "#ff1493", "#ff69b4", "#ff1493", "#ff69b4"],
			shapes: ["circle", "square"],
		});

		// Additional confetti burst
		setTimeout(() => {
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.4, x: 0.3 },
				colors: ["#ff69b4", "#ff1493", "#ff69b4"],
			});
		}, 200);
	};

	const openModal = (image, index) => {
		setSelectedImage(image);
		setCurrentImageIndex(index);
	};

	const closeModal = () => {
		setIsClosing(true);
		setTimeout(() => {
			setSelectedImage(null);
			setIsClosing(false);
		}, 300);
	};

	const goToPrevious = () => {
		if (selectedImage) {
			const currentIndex = images.findIndex(
				(img) => img.src === selectedImage.src
			);
			const newIndex =
				currentIndex === 0 ? images.length - 1 : currentIndex - 1;
			setSelectedImage(images[newIndex]);
			setCurrentImageIndex(newIndex);
		}
	};

	const goToNext = () => {
		if (selectedImage) {
			const currentIndex = images.findIndex(
				(img) => img.src === selectedImage.src
			);
			const newIndex =
				currentIndex === images.length - 1 ? 0 : currentIndex + 1;
			setSelectedImage(images[newIndex]);
			setCurrentImageIndex(newIndex);
		}
	};

	// Array of all our beautiful memories
	const images = [
		{ src: "/assets/memory-1-sunset.jpeg", alt: "Beautiful sunset together" },
		{ src: "/assets/memory-2-cafe.jpeg", alt: "Coffee date memories" },
		{ src: "/assets/memory-3-park.jpeg", alt: "Park adventures" },
		{ src: "/assets/memory-4-beach.jpeg", alt: "Beach day fun" },
		{ src: "/assets/memory-5-mountains.jpeg", alt: "Mountain exploration" },
		{ src: "/assets/memory-6-dinner.jpeg", alt: "Romantic dinner" },
		{ src: "/assets/memory-7-concert.jpeg", alt: "Concert night" },
		{ src: "/assets/memory-8-movie.jpeg", alt: "Movie night" },
		{ src: "/assets/memory-9-coffee.jpeg", alt: "Coffee shop memories" },
		{ src: "/assets/memory-10-walk.jpeg", alt: "Evening walks" },
		{ src: "/assets/memory-11-garden.jpeg", alt: "Garden visits" },
		{ src: "/assets/memory-12-bridge.jpeg", alt: "Bridge crossing" },
		{ src: "/assets/memory-13-lake.jpeg", alt: "Lake reflections" },
		{ src: "/assets/memory-14-forest.jpeg", alt: "Forest exploration" },
		{ src: "/assets/memory-15-river.jpeg", alt: "River adventures" },
		{ src: "/assets/memory-16-city.jpeg", alt: "City lights" },
		{ src: "/assets/memory-17-street.jpeg", alt: "Street art" },
		{ src: "/assets/memory-18-sunrise.jpeg", alt: "Early morning sunrise" },
		{ src: "/assets/memory-19-flowers.jpeg", alt: "Beautiful flowers" },
		{ src: "/assets/memory-20-butterfly.jpeg", alt: "Butterfly encounter" },
		{ src: "/assets/memory-21-heart.jpeg", alt: "Heart-shaped memories" },
		{ src: "/assets/memory-22-special.jpeg", alt: "Special moment" },
	];

	// Create infinite scroll by duplicating the array multiple times
	const infiniteImages = [
		...images,
		...images,
		...images,
		...images,
		...images,
	];

	// Track mouse movement for glitter effects
	useEffect(() => {
		const handleMouseMove = (e) => {
			setMousePosition({ x: e.clientX, y: e.clientY });

			// Add glitter trail point
			const newGlitter = {
				id: Date.now() + Math.random(),
				x: e.clientX,
				y: e.clientY,
				type: Math.random() < 0.3 ? "heart" : "sparkle",
				color: [
					"#ff69b4",
					"#ff1493",
					"#ff69b4",
					"#ff1493",
					"#ff69b4",
					"#ff69b4",
					"#ff1493",
					"#ff69b4",
				][Math.floor(Math.random() * 8)],
				size: Math.random() * 8 + 4,
				rotation: Math.random() * 360,
			};
			setGlitterTrail((prev) => [...prev.slice(-15), newGlitter]);

			// Remove glitter after animation
			setTimeout(() => {
				setGlitterTrail((prev) => prev.filter((g) => g.id !== newGlitter.id));
			}, 2000);

			// Generate sparkles randomly
			if (Math.random() < 0.4) {
				const sparkle = {
					id: Date.now() + Math.random(),
					x: e.clientX + (Math.random() - 0.5) * 60,
					y: e.clientY + (Math.random() - 0.5) * 60,
					emoji: ["✨", "⭐", "💫", "🌟", "💎", "🌸", "🍀", "🎈"][
						Math.floor(Math.random() * 8)
					],
					size: Math.random() * 12 + 8,
				};
				setSparkles((prev) => [...prev, sparkle]);
				setTimeout(
					() => setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id)),
					1500
				);
			}
		};

		document.addEventListener("mousemove", handleMouseMove);
		return () => document.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 relative overflow-hidden">
			{/* Background Music */}
			{/* 
				To add "Ceilings" by Lizzy McAlpine:
				1. Download the song from official sources
				2. Rename to: ceilings-lizzy-mcalpine.mp3
				3. Place in: public/assets/ceilings-lizzy-mcalpine.mp3
				See MUSIC_SETUP.md for detailed instructions
			*/}
			<audio
				ref={audioRef}
				loop
				preload="auto"
				volume={audioVolume}
				autoPlay={true}
			>
				<source
					src="/assets/ceilings-lizzy-mcalpine.mp3"
					type="audio/mpeg"
				/>
				<source
					src="/assets/ceilings-lizzy-mcalpine.mp3"
					type="audio/mp3"
				/>
				Your browser does not support the audio element.
			</audio>

			{/* Autoplay Indicator */}
			{autoplayAttempting && (
				<div className="fixed top-4 left-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
					<div className="flex items-center gap-2">
						<span className="text-sm animate-spin">⏳</span>
						<span className="text-sm font-medium">Starting music...</span>
					</div>
				</div>
			)}

			{/* Music Controls */}
			<div className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg border border-pink-200">
				<div className="flex items-center gap-3">
					<button
						ref={playButtonRef}
						onClick={toggleAudio}
						className={`w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transform transition-all duration-300 shadow-lg relative ${
							audioFileExists
								? "bg-gradient-to-r from-pink-500 to-purple-600"
								: "bg-gradient-to-r from-gray-400 to-gray-600"
						}`}
					>
						{!audioFileExists ? (
							<span className="text-lg">⚠️</span>
						) : autoplayAttempting ? (
							<span className="text-lg animate-spin">⏳</span>
						) : isPlaying ? (
							<>
								<span className="text-lg">⏸️</span>
								{/* Animated music notes when playing */}
								<div className="absolute -top-2 -right-2 text-xs animate-bounce">
									🎵
								</div>
							</>
						) : (
							<span className="text-lg">🎵</span>
						)}
					</button>
					{audioFileExists && (
						<div className="flex items-center gap-2">
							<span className="text-pink-600 text-sm">🔊</span>
							<input
								type="range"
								min="0"
								max="1"
								step="0.1"
								value={audioVolume}
								onChange={handleVolumeChange}
								className="w-16 h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer slider"
							/>
						</div>
					)}
					{/* Music status indicator */}
					{isPlaying && audioFileExists && (
						<div className="flex items-center gap-1">
							<div className="w-1 h-3 bg-pink-500 rounded-full animate-pulse"></div>
							<div
								className="w-1 h-5 bg-purple-500 rounded-full animate-pulse"
								style={{ animationDelay: "0.2s" }}
							></div>
							<div
								className="w-1 h-4 bg-pink-500 rounded-full animate-pulse"
								style={{ animationDelay: "0.4s" }}
							></div>
						</div>
					)}
				</div>
			</div>

			{/* Music Notification */}
			{isPlaying && (
				<div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
					<div className="flex items-center gap-2">
						<span className="text-xl">🎵</span>
						<span className="font-semibold">
							{!audioFileExists
								? "Please add the song file! 📁"
								: autoplayAttempting
								? "Starting music... ⏳"
								: '"Ceilings" by Lizzy McAlpine playing! 💕'}
						</span>
						<span className="text-xl">🎶</span>
					</div>
				</div>
			)}

			{/* Glitter Trail */}
			{glitterTrail.map((glitter, index) => (
				<div
					key={glitter.id}
					className="absolute pointer-events-none animate-glitter"
					style={{
						left: glitter.x - glitter.size / 2,
						top: glitter.y - glitter.size / 2,
						width: glitter.size,
						height: glitter.size,
						backgroundColor: glitter.color,
						borderRadius: "50%",
						opacity: 1 - index * 0.06,
						animationDelay: `${index * 0.1}s`,
						transform: `rotate(${glitter.rotation}deg)`,
						zIndex: 30,
					}}
				/>
			))}

			{/* Sparkles */}
			{sparkles.map((sparkle) => (
				<div
					key={sparkle.id}
					className="absolute pointer-events-none animate-sparkle"
					style={{
						left: sparkle.x,
						top: sparkle.y,
						fontSize: sparkle.size,
						zIndex: 25,
					}}
				>
					{sparkle.emoji}
				</div>
			))}

			{/* Floating Hearts - Reduced frequency */}
			{hearts.map((heart) => (
				<div
					key={heart.id}
					className="absolute text-pink-400 animate-float pointer-events-none"
					style={{
						left: heart.x,
						top: heart.y,
						fontSize: heart.size,
						transform: `rotate(${heart.rotation}deg)`,
						animationDuration: `${8 / heart.speed}s`,
					}}
				>
					💖
				</div>
			))}

			{/* Hover Hearts */}
			{hoverHearts.map((heart) => (
				<div
					key={heart.id}
					className="absolute text-pink-500 animate-hover-float pointer-events-none z-20"
					style={{
						left: heart.x,
						top: heart.y,
						fontSize: heart.size,
						transform: `rotate(${heart.rotation}deg)`,
						animationDuration: `${3 / heart.speed}s`,
					}}
				>
					💖
				</div>
			))}

			{/* Floating Music Notes - Only when music is playing */}
			{isPlaying && (
				<>
					<div
						className="absolute text-purple-400 animate-float pointer-events-none"
						style={{
							left: "10%",
							top: "20%",
							fontSize: "24px",
							animationDuration: "6s",
							animationDelay: "0s",
						}}
					>
						🎵
					</div>
					<div
						className="absolute text-pink-400 animate-float pointer-events-none"
						style={{
							left: "80%",
							top: "30%",
							fontSize: "20px",
							animationDuration: "7s",
							animationDelay: "2s",
						}}
					>
						🎶
					</div>
					<div
						className="absolute text-purple-400 animate-float pointer-events-none"
						style={{
							left: "15%",
							top: "70%",
							fontSize: "18px",
							animationDuration: "8s",
							animationDelay: "4s",
						}}
					>
						🎵
					</div>
					<div
						className="absolute text-pink-400 animate-float pointer-events-none"
						style={{
							left: "85%",
							top: "60%",
							fontSize: "22px",
							animationDuration: "5s",
							animationDelay: "1s",
						}}
					>
						🎶
					</div>
				</>
			)}

			{/* Super Playful Background Elements */}
			<div className="absolute inset-0 pointer-events-none">
				{/* Dancing Emojis */}
				<div
					className="absolute top-1/6 left-1/5 text-4xl animate-bounce"
					style={{ animationDuration: "2s", animationDelay: "0.2s" }}
				>
					🎪
				</div>
				<div
					className="absolute top-1/4 right-1/4 text-3xl animate-bounce"
					style={{ animationDuration: "2.5s", animationDelay: "0.8s" }}
				>
					🎭
				</div>
				<div
					className="absolute bottom-1/4 left-1/4 text-4xl animate-bounce"
					style={{ animationDuration: "1.8s", animationDelay: "1.2s" }}
				>
					🎨
				</div>
				<div
					className="absolute bottom-1/3 right-1/5 text-3xl animate-bounce"
					style={{ animationDuration: "3s", animationDelay: "0.5s" }}
				>
					🎯
				</div>

				{/* Spinning Stars */}
				<div
					className="absolute top-1/3 left-1/8 text-yellow-400 text-2xl animate-spin"
					style={{ animationDuration: "4s" }}
				>
					⭐
				</div>
				<div
					className="absolute top-2/3 right-1/8 text-yellow-400 text-xl animate-spin"
					style={{ animationDuration: "6s", animationDirection: "reverse" }}
				>
					🌟
				</div>
				<div
					className="absolute bottom-1/3 left-1/6 text-yellow-400 text-2xl animate-spin"
					style={{ animationDuration: "5s" }}
				>
					💫
				</div>

				{/* Floating Balloons - More Colorful */}
				<div
					className="absolute top-1/5 right-1/8 text-red-400 text-3xl animate-bounce"
					style={{ animationDuration: "2.2s", animationDelay: "0.3s" }}
				>
					🎈
				</div>
				<div
					className="absolute top-1/2 left-1/8 text-blue-400 text-2xl animate-bounce"
					style={{ animationDuration: "2.8s", animationDelay: "1.1s" }}
				>
					🎈
				</div>
				<div
					className="absolute bottom-1/5 right-1/6 text-green-400 text-3xl animate-bounce"
					style={{ animationDuration: "2.5s", animationDelay: "0.7s" }}
				>
					🎈
				</div>
				<div
					className="absolute top-3/4 left-1/6 text-yellow-400 text-2xl animate-bounce"
					style={{ animationDuration: "3.1s", animationDelay: "1.5s" }}
				>
					🎈
				</div>

				{/* Fun Shapes - More Colorful and Animated */}
				<div
					className="absolute top-1/8 right-1/6 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse"
					style={{ animationDelay: "0.4s" }}
				></div>
				<div
					className="absolute bottom-1/8 left-1/6 w-4 h-4 bg-gradient-to-r from-blue-400 to-green-500 rounded-full animate-pulse"
					style={{ animationDelay: "1.2s" }}
				></div>
				<div
					className="absolute top-3/4 right-1/4 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"
					style={{ animationDelay: "0.8s" }}
				></div>
				<div
					className="absolute bottom-1/4 left-1/5 w-7 h-7 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse"
					style={{ animationDelay: "1.6s" }}
				></div>

				{/* Rotating Geometric Shapes */}
				<div
					className="absolute top-1/4 left-1/3 w-8 h-8 border-4 border-pink-400 rounded-full animate-spin"
					style={{ animationDuration: "8s" }}
				></div>
				<div
					className="absolute bottom-1/4 right-1/3 w-6 h-6 border-4 border-purple-400 rounded-full animate-spin"
					style={{ animationDuration: "10s", animationDirection: "reverse" }}
				></div>
				<div
					className="absolute top-1/2 right-1/8 w-5 h-5 border-4 border-blue-400 rounded-full animate-spin"
					style={{ animationDuration: "6s" }}
				></div>

				{/* Bouncing Dots */}
				<div
					className="absolute top-1/6 left-1/4 w-3 h-3 bg-pink-500 rounded-full animate-bounce"
					style={{ animationDelay: "0.2s" }}
				></div>
				<div
					className="absolute top-1/6 left-1/4 w-3 h-3 bg-pink-500 rounded-full animate-bounce"
					style={{
						transform: "translateX(20px) translateY(15px)",
						animationDelay: "0.4s",
					}}
				></div>
				<div
					className="absolute top-1/6 left-1/4 w-3 h-3 bg-pink-500 rounded-full animate-bounce"
					style={{
						transform: "translateX(40px) translateY(30px)",
						animationDelay: "0.6s",
					}}
				></div>

				<div
					className="absolute bottom-1/6 right-1/4 w-3 h-3 bg-purple-500 rounded-full animate-bounce"
					style={{ animationDelay: "0.3s" }}
				></div>
				<div
					className="absolute bottom-1/6 right-1/4 w-3 h-3 bg-purple-500 rounded-full animate-bounce"
					style={{
						transform: "translateX(-20px) translateY(-15px)",
						animationDelay: "0.5s",
					}}
				></div>
				<div
					className="absolute bottom-1/6 right-1/4 w-3 h-3 bg-purple-500 rounded-full animate-bounce"
					style={{
						transform: "translateX(-40px) translateY(-30px)",
						animationDelay: "0.7s",
					}}
				></div>

				{/* Rainbow Gradient Waves - More Vibrant */}
				<div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-pink-300/30 via-purple-300/25 to-transparent"></div>
				<div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-purple-300/30 via-pink-300/25 to-transparent"></div>

				{/* Fun Corner Decorations */}
				<div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-pink-400 rounded-tl-3xl animate-pulse"></div>
				<div
					className="absolute top-0 right-0 w-20 h-20 border-r-4 border-t-4 border-purple-400 rounded-tr-3xl animate-pulse"
					style={{ animationDelay: "0.5s" }}
				></div>
				<div
					className="absolute bottom-0 left-0 w-20 h-20 border-l-4 border-b-4 border-pink-400 rounded-bl-3xl animate-pulse"
					style={{ animationDelay: "1s" }}
				></div>
				<div
					className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-purple-400 rounded-br-3xl animate-pulse"
					style={{ animationDelay: "1.5s" }}
				></div>

				{/* Floating Fun Emojis */}
				<div
					className="absolute top-1/8 right-1/5 text-2xl animate-bounce"
					style={{ animationDuration: "2.5s", animationDelay: "0.3s" }}
				>
					🎲
				</div>
				<div
					className="absolute bottom-1/8 left-1/5 text-2xl animate-bounce"
					style={{ animationDuration: "3s", animationDelay: "1.1s" }}
				>
					🎪
				</div>
				<div
					className="absolute top-2/3 left-1/4 text-2xl animate-bounce"
					style={{ animationDuration: "2.8s", animationDelay: "0.7s" }}
				>
					🎭
				</div>
				<div
					className="absolute bottom-2/3 right-1/4 text-2xl animate-bounce"
					style={{ animationDuration: "2.3s", animationDelay: "1.4s" }}
				>
					🎨
				</div>

				{/* Twinkling Stars */}
				<div
					className="absolute top-1/4 left-1/6 text-yellow-400 text-sm animate-ping"
					style={{ animationDelay: "0.2s" }}
				>
					⭐
				</div>
				<div
					className="absolute top-3/4 right-1/6 text-yellow-400 text-sm animate-ping"
					style={{ animationDelay: "0.6s" }}
				>
					⭐
				</div>
				<div
					className="absolute bottom-1/4 left-1/3 text-yellow-400 text-sm animate-ping"
					style={{ animationDelay: "0.4s" }}
				>
					⭐
				</div>
				<div
					className="absolute top-1/2 right-1/3 text-yellow-400 text-sm animate-ping"
					style={{ animationDelay: "0.8s" }}
				>
					⭐
				</div>
			</div>

			{/* Simple Corner Decorations - Just a few */}
			<div
				className="absolute top-8 left-8 text-3xl animate-pulse"
				style={{ animationDelay: "1s" }}
			>
				🌸
			</div>
			<div
				className="absolute top-8 right-8 text-3xl animate-pulse"
				style={{ animationDelay: "2s" }}
			>
				💕
			</div>
			<div
				className="absolute bottom-8 left-8 text-3xl animate-pulse"
				style={{ animationDelay: "1.5s" }}
			>
				✨
			</div>
			<div
				className="absolute bottom-8 right-8 text-3xl animate-pulse"
				style={{ animationDelay: "0.5s" }}
			>
				💖
			</div>

			<div className="relative z-10 container mx-auto px-4 py-8">
				{/* Question */}
				<div className="text-center mb-12">
					<h1 className="text-6xl font-bold text-pink-600 mb-4 animate-pulse">
						Will you be my girlfriend? 💕
					</h1>
					<p className="text-2xl text-purple-600 font-semibold animate-bounce">
						Scroll through our memories together! 💕
					</p>
					{/* Cute subtitle */}
					<p
						className="text-lg text-pink-500 mt-2 animate-pulse"
						style={{ animationDelay: "1s" }}
					>
						✨ Move your mouse around for magic! ✨
					</p>
				</div>

				{/* Yes/No Buttons */}
				{!yesClicked && (
					<div className="text-center mb-12 relative">
						<div className="flex justify-center gap-8 items-center">
							{/* Yes Button */}
							<button
								onClick={handleYesClick}
								className="px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-2xl font-bold rounded-full shadow-2xl hover:scale-110 transform transition-all duration-300 animate-bounce hover:animate-none"
								style={{ animationDelay: "0.5s" }}
							>
								Yes! 💖
							</button>

							{/* No Button - Moves away */}
							<button
								onMouseEnter={moveNoButton}
								onClick={moveNoButton}
								className="px-12 py-4 bg-gradient-to-r from-gray-400 to-gray-600 text-white text-2xl font-bold rounded-full shadow-2xl hover:scale-110 transform transition-all duration-300 absolute"
								style={{
									left: noButtonPosition.x,
									top: noButtonPosition.y,
									zIndex: 20,
								}}
							>
								No 😢
							</button>
						</div>
					</div>
				)}

				{/* Celebration Message */}
				{yesClicked && (
					<div className="text-center mb-12 animate-fade-in">
						<h2 className="text-5xl font-bold text-pink-600 mb-4 animate-bounce">
							Yay! 🎉💕
						</h2>
						<p className="text-2xl text-purple-600 font-semibold animate-pulse">
							I&apos;m so happy! You&apos;ve made me the luckiest person! 💖✨
						</p>
						<div className="flex justify-center gap-4 mt-6">
							<div
								className="text-4xl animate-bounce"
								style={{ animationDelay: "0.2s" }}
							>
								💕
							</div>
							<div
								className="text-4xl animate-bounce"
								style={{ animationDelay: "0.4s" }}
							>
								💖
							</div>
							<div
								className="text-4xl animate-bounce"
								style={{ animationDelay: "0.6s" }}
							>
								💝
							</div>
							<div
								className="text-4xl animate-bounce"
								style={{ animationDelay: "0.8s" }}
							>
								💗
							</div>
							<div
								className="text-4xl animate-bounce"
								style={{ animationDelay: "1s" }}
							>
								💓
							</div>
						</div>
					</div>
				)}

				{/* Infinite Scroll Gallery */}
				<div className="relative overflow-hidden">
					<div
						className="flex gap-6 animate-scroll"
						style={{
							animation: "scroll 60s linear infinite",
							width: `${infiniteImages.length * 300}px`,
						}}
					>
						{infiniteImages.map((image, index) => (
							<div
								key={index}
								className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:rotate-2 flex-shrink-0 animate-dance"
								onClick={() => openModal(image, index % images.length)}
								style={{
									width: "280px",
									animationDelay: `${(index % 22) * 0.2}s`,
									animationDuration: `${2 + (index % 22) * 0.1}s`,
								}}
							>
								<div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-2">
									<Image
										src={image.src}
										alt={image.alt}
										width={280}
										height={280}
										className="w-full h-64 object-cover rounded-xl transition-transform duration-300 group-hover:scale-110"
									/>
									{/* Heart burst effect on hover */}
									<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
										<div className="text-6xl text-pink-400 animate-ping">
											💖
										</div>
									</div>
									{/* Cute corner decoration */}
									<div
										className="absolute top-2 right-2 text-2xl animate-bounce"
										style={{ animationDelay: "0.5s" }}
									>
										🌸
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Scroll indicator */}
				<div className="text-center mt-8">
					<p className="text-lg text-purple-600 font-medium animate-pulse">
						✨ Keep scrolling to see more memories! ✨
					</p>
					{/* Cute emoji row */}
					<div className="flex justify-center gap-4 mt-4">
						<div
							className="text-2xl animate-bounce"
							style={{ animationDelay: "0.2s" }}
						>
							💖
						</div>
						<div
							className="text-2xl animate-bounce"
							style={{ animationDelay: "0.4s" }}
						>
							💕
						</div>
						<div
							className="text-2xl animate-bounce"
							style={{ animationDelay: "0.6s" }}
						>
							💝
						</div>
						<div
							className="text-2xl animate-bounce"
							style={{ animationDelay: "0.8s" }}
						>
							💗
						</div>
						<div
							className="text-2xl animate-bounce"
							style={{ animationDelay: "1s" }}
						>
							💓
						</div>
					</div>
				</div>
			</div>

			{/* Modal */}
			{selectedImage && (
				<div
					className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-all duration-300 ${
						isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
					}`}
					onClick={closeModal}
				>
					<div
						className="relative max-w-4xl max-h-[90vh] p-4"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={closeModal}
							className="absolute top-2 right-2 text-white text-4xl hover:text-pink-300 transition-colors z-10"
						>
							×
						</button>
						<Image
							src={selectedImage.src}
							alt={selectedImage.alt}
							width={800}
							height={600}
							className="max-w-full max-h-full object-contain rounded-lg"
						/>
						<div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
							<button
								onClick={goToPrevious}
								className="text-white text-4xl hover:text-pink-300 transition-colors pointer-events-auto bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
							>
								‹
							</button>
							<button
								onClick={goToNext}
								className="text-white text-4xl hover:text-pink-300 transition-colors pointer-events-auto bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
							>
								›
							</button>
						</div>
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg bg-black bg-opacity-50 px-4 py-2 rounded-full">
							{currentImageIndex + 1} / {images.length}
						</div>
					</div>
				</div>
			)}

			<style jsx>{`
				@keyframes scroll {
					0% {
						transform: translateX(0);
					}
					100% {
						transform: translateX(-${images.length * 300}px);
					}
				}

				@keyframes dance {
					0%,
					100% {
						transform: rotate(-2deg);
					}
					25% {
						transform: rotate(0deg);
					}
					50% {
						transform: rotate(2deg);
					}
					75% {
						transform: rotate(0deg);
					}
				}

				@keyframes glitter-fade {
					0% {
						opacity: 1;
						transform: scale(1) rotate(0deg);
					}
					50% {
						opacity: 0.7;
						transform: scale(1.2) rotate(180deg);
					}
					100% {
						opacity: 0;
						transform: scale(0.5) rotate(360deg);
					}
				}

				@keyframes sparkle-bounce {
					0%,
					100% {
						transform: translateY(0) scale(1);
						opacity: 1;
					}
					50% {
						transform: translateY(-10px) scale(1.1);
						opacity: 0.8;
					}
				}

				.animate-dance {
					animation: dance 3s ease-in-out infinite;
				}

				.animate-fade-in {
					animation: fade-in 0.3s ease-out forwards;
				}

				.animate-fade-out {
					animation: fade-out 0.3s ease-in forwards;
				}

				.animate-fade-in-delay {
					animation: fade-in 0.8s ease-out 0.3s forwards;
					opacity: 0;
				}

				.animate-fade-in-up {
					animation: fade-in-up 0.6s ease-out forwards;
					opacity: 0;
				}

				.animate-fade-in-up-delay {
					animation: fade-in-up 0.8s ease-out 0.5s forwards;
					opacity: 0;
				}

				.animate-scale-in {
					animation: scale-in 0.3s ease-out forwards;
				}

				.animate-scale-out {
					animation: scale-out 0.3s ease-in forwards;
				}

				.animate-float {
					animation: float 8s linear forwards;
				}

				.animate-sparkle {
					animation: sparkle-bounce 1.5s ease-out forwards;
				}

				.animate-hover-float {
					animation: hover-float 3s ease-out forwards;
				}

				.animate-glitter {
					animation: glitter-fade 2s ease-out forwards;
				}

				.animate-sparkle {
					animation: sparkle-bounce 1.5s ease-out forwards;
				}

				/* Custom slider styles */
				.slider::-webkit-slider-thumb {
					appearance: none;
					height: 16px;
					width: 16px;
					border-radius: 50%;
					background: linear-gradient(45deg, #ff69b4, #ff1493);
					cursor: pointer;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
				}

				.slider::-moz-range-thumb {
					height: 16px;
					width: 16px;
					border-radius: 50%;
					background: linear-gradient(45deg, #ff69b4, #ff1493);
					cursor: pointer;
					border: none;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
				}

				.slider::-webkit-slider-track {
					background: linear-gradient(90deg, #ffb6c1, #ff69b4);
					border-radius: 10px;
					height: 8px;
				}

				.slider::-moz-range-track {
					background: linear-gradient(90deg, #ffb6c1, #ff69b4);
					border-radius: 10px;
					height: 8px;
					border: none;
				}
			`}</style>
		</main>
	);
}
