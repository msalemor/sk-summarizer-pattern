.PHONY: default clean build-ui run run-py run-pylang docker docker-run docker-push docker-py-run

DOTNET_RUN=dotnet watch run
PYTHON_APP=main:app
PYTHON_RUN=uvicorn $(PYTHON_APP)
BUN_BUILD=bun run build
NET_WWW_FOLDER=src/backend/wwwroot
PY_WWW_FOLDER=src/pybackend/wwwroot
PYLANG_WWW_FOLDER=src/pylangbackend/wwwroot

default:
	@echo "Please specify a target to make."

clean:
	@echo "Resetting the folder"
	rm -rf $(NET_WWW_FOLDER)
	mkdir $(NET_WWW_FOLDER)
	rm -rf $(PY_WWW_FOLDER)
	mkdir $(PY_WWW_FOLDER)
	rm -rf $(PYLANG_WWW_FOLDER)
	mkdir $(PYLANG_WWW_FOLDER)

build-ui: clean
	@echo "Building UI..."
	cd src/frontend && $(BUN_BUILD)
	cp -r src/frontend/dist/* $(NET_WWW_FOLDER)
	cp -r src/frontend/dist/* $(PY_WWW_FOLDER)
	cp -r src/frontend/dist/* $(PYLANG_WWW_FOLDER)

run: build-ui
	@echo "Building UI..."	
	cd src/backend && $(DOTNET_RUN)

run-py: build-ui
	@echo "Building UI..."	
	cd src/pybackend && $(PYTHON_RUN)

run-pylang: build-ui
	@echo "Building UI..."	
	cd src/pylangbackend && $(PYTHON_RUN)

DOCKER_TAG=0.0.6
docker: build-ui
	@echo ".NET build..."
	cd src/backend && docker build . -t am8850/sksummarizer:$(DOCKER_TAG)
	@echo "Python SK build..."
	cd src/pybackend && docker build . -t am8850/pysksummarizer:$(DOCKER_TAG)
	@echo "Python Langchain build..."
	cd src/pybackend && docker build . -t am8850/pylangsksummarizer:$(DOCKER_TAG)

docker-push: docker
	@echo "Docker .NET push..."
	docker push am8850/sksummarizer:$(DOCKER_TAG)
	@echo "Docker Python SK push..."
	docker push am8850/pysksummarizer:$(DOCKER_TAG)
	@echo "Docker Python LangChain push..."
	docker push am8850/pylangsksummarizer:$(DOCKER_TAG)

docker-run:
	@echo "Run .NET Docker Image"
	cd src/backend && docker build . -t am8850/sksummarizer:$(DOCKER_TAG)
	cd src/backend && docker run --rm -p 8080:80 --env-file=.env am8850/sksummarizer:$(DOCKER_TAG)

docker-py-run:
	@echo "Run Python Docker Image"
	cd src/pybackend && docker build . -t am8850/pysksummarizer:$(DOCKER_TAG)
	cd src/pybackend && docker run --rm -p 8080:80 --env-file=.env am8850/pysksummarizer:$(DOCKER_TAG)

docker-pylang-run:
	@echo "Run Python Docker Image"
	cd src/pybackend && docker build . -t am8850/pylangsksummarizer:$(DOCKER_TAG)
	cd src/pybackend && docker run --rm -p 8080:80 --env-file=.env am8850/pylangsksummarizer:$(DOCKER_TAG)