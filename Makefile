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

clean-cs:
	@echo "Resetting the folder"
	rm -rf $(NET_WWW_FOLDER)
	mkdir $(NET_WWW_FOLDER)

clean-py:
	@echo "Resetting the folder"
	rm -rf $(PY_WWW_FOLDER)
	mkdir $(PY_WWW_FOLDER)

clean-lang:	
	@echo "Resetting the folder"
	rm -rf $(PYLANG_WWW_FOLDER)
	mkdir $(PYLANG_WWW_FOLDER)

build-ui-cs: clean-cs
	@echo "Building UI cs..."
	cd src/frontend && $(BUN_BUILD)
	cp -r src/frontend/dist/* $(NET_WWW_FOLDER)

build-ui-py: clean-py
	@echo "Building UI py..."
	cp -r src/frontend/dist/* $(PY_WWW_FOLDER)	

build-ui-lang: clean-lang
	@echo "Building UI lang..."
	cp -r src/frontend/dist/* $(PYLANG_WWW_FOLDER)

run-backend-cs: build-ui-cs
	@echo "Running Backend cs..."
	cd src/backend && $(DOTNET_RUN)

run-cs: build-ui-cs
	@echo "Running UI cs..."	
	cd src/backend && $(DOTNET_RUN)

run-py: build-ui-py
	@echo "Running UI py..."	
	cd src/pybackend && $(PYTHON_RUN)

run-pylang: build-ui-lang
	@echo "Running UI lang..."	
	cd src/pylangbackend && $(PYTHON_RUN)

DOCKER_TAG=0.0.8
docker-cs: build-ui-cs
	@echo ".NET build..."
	cd src/backend && docker build . -t am8850/sksummarizer:$(DOCKER_TAG)

docker-py: build-ui-py
	@echo "Python SK build..."
	cd src/pybackend && docker build . -t am8850/pysksummarizer:$(DOCKER_TAG)

docker-lang: build-ui-lang
	@echo "Python Langchain build..."
	cd src/pybackend && docker build . -t am8850/pylangsksummarizer:$(DOCKER_TAG)

frontend1:
	rm -rf src/backend/wwwroot
	mkdir src/backend/wwwroot
	cd src/frontend1 && bun run build
	cp -r src/frontend1/dist/* src/backend/wwwroot

docker-run-cs: docker-cs
	@echo "Run .NET Docker Image"	
	cd src/backend && docker run --rm -p 8055:80 --env-file=.env am8850/sksummarizer:$(DOCKER_TAG)

docker-run-cs-1: 
	@echo "Run .NET Docker Image"
	cd src/frontend1 && bun run build
	rm -rf src/backend/wwwroot
	mkdir src/backend/wwwroot
	cp -r src/frontend1/dist/* src/backend/wwwroot
	cd src/backend && docker build . -t am8850/sksummarizer:$(DOCKER_TAG)
	cd src/backend && docker run --rm -p 8055:80 --env-file=.env am8850/sksummarizer:$(DOCKER_TAG)

docker-run-py: docker-py
	@echo "Run Python Docker Image"
	cd src/pybackend && docker build . -t am8850/pysksummarizer:$(DOCKER_TAG)
	cd src/pybackend && docker run --rm -p 8080:80 --env-file=.env am8850/pysksummarizer:$(DOCKER_TAG)

docker-run-lang: docker-lang
	@echo "Run Python Docker Image"
	cd src/pybackend && docker build . -t am8850/pylangsksummarizer:$(DOCKER_TAG)
	cd src/pybackend && docker run --rm -p 8080:80 --env-file=.env am8850/pylangsksummarizer:$(DOCKER_TAG)

docker-push-cs: docker-cs
	@echo "Docker .NET push..."
	docker push am8850/sksummarizer:$(DOCKER_TAG)

docker-push-cs-acr: docker-cs
	az acr login --name am8850
	docker tag am8850/sksummarizer:$(DOCKER_TAG) alemor.azurecr.io/sksummarizer:$(DOCKER_TAG)
	docker push alemor.azurecr.io/sksummarizer:$(DOCKER_TAG)

docker-push-py: docker-py
	@echo "Docker Python SK push..."
	docker push am8850/pysksummarizer:$(DOCKER_TAG)

docker-push-lang: docker-lang
	@echo "Docker Python LangChain push..."
	docker push am8850/pylangsksummarizer:$(DOCKER_TAG)