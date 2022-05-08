XARGS           := xargs -P$(shell nproc)
NPX				:= npx
NPMR			:= npm run
NODE 			:= node --enable-source-maps

.DEFAULT_GOAL   := default

default:

help: ## Self-documented Makefile
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
