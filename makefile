# Makefile for automating npm quartz sync

.PHONY: sync

# Target to run npm quartz sync
sync:
	@echo "Running quartz sync..."
	npm run quartz sync

# Default target
all: sync
