default:
	@echo "Please specify a target to make."

clean:
	@echo "Resetting the folder"
	rm -rf server/wwwroot
	mkdir server/wwwroot
	rm -rf src/pybackend/wwwroot
	mkdir src/pybackend/wwwroot

build-ui: clean
	@echo "Building UI..."
	cd src/frontend && bun run build
	cp -r src/frontend/dist/* server/wwwroot
	cp -r src/frontend/dist/* src/pybackend/wwwroot

run: build-ui
	@echo "Building UI..."	
	cd server && dotnet watch run

TAG=0.0.3
docker: build-ui
	@echo "Docker build..."
	cd server && docker build . -t am8850/sksummarizer:${TAG}

docker-run: docker
	cd server && docker run --rm -p 8080:80 --env-file=.env am8850/sksummarizer:${TAG}

docker-push: docker
	@echo "Docker push..."
	docker push am8850/sksummarizer:${TAG}

docker-py: build-ui
	@echo "Build Docker Image"

	cd src/pybackend && docker build . -t am8850/pysksummarizer:${TAG}

docker-py-run: docker-py
	@echo "Run Python Docker Image"
	cd src/pybackend && docker run --rm -p 8080:80 --env-file=.env am8850/pysksummarizer:${TAG}