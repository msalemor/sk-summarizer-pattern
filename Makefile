.PHONY: default clean build-ui run docker docker-run docker-push docker-py-run

DOTNET_RUN=dotnet watch run
PYTHON_APP=main:app
PYTHON_RUN=uvicorn $(PYTHON_APP)
BUN_BUILD=bun run build
DOCKER_TAG=0.0.4
NET_WWW_FOLDER=src/backend/wwwroot
PY_WWW_FOLDER=src/pybackend/wwwroot

default:
	@echo "Please specify a target to make."

clean:
	@echo "Resetting the folder"
	rm -rf $(NET_WWW_FOLDER)
	mkdir $(NET_WWW_FOLDER)
	rm -rf $(PY_WWW_FOLDER)
	mkdir $(PY_WWW_FOLDER)

build-ui: clean
	@echo "Building UI..."
	cd src/frontend && $(BUN_BUILD)
	cp -r src/frontend/dist/* $(NET_WWW_FOLDER)
	cp -r src/frontend/dist/* $(PY_WWW_FOLDER)

run: build-ui
	@echo "Building UI..."	
	cd src/backend && $(DOTNET_RUN)

run-py: build-ui
	@echo "Building UI..."	
	cd src/pybackend && $(PYTHON_RUN)

docker: build-ui
	@echo ".NET build..."
	cd src/backend && docker build . -t am8850/sksummarizer:$(DOCKER_TAG)
	@echo "Python build..."
	cd src/pybackend && docker build . -t am8850/pysksummarizer:$(DOCKER_TAG)

docker-push: docker
	@echo "Docker .NET push..."
	docker push am8850/sksummarizer:$(DOCKER_TAG)
	@echo "Docker Python push..."
	docker push am8850/pysksummarizer:$(DOCKER_TAG)

docker-run: docker
	@echo "Run .NET Docker Image"
	cd src/backend && docker run --rm -p 8080:80 --env-file=.env am8850/sksummarizer:$(DOCKER_TAG)

docker-py-run: docker-py
	@echo "Run Python Docker Image"
	cd src/pybackend && docker run --rm -p 8080:80 --env-file=.env am8850/pysksummarizer:$(DOCKER_TAG)
