var particles = [];
var cx,cy;
function setup() {
	createCanvas(windowWidth, windowHeight);
	cx=windowWidth/2;
	cy=windowHeight/2;
	stroke(255);
	for (var i = 100; i >= 0; i--) {
		var p=new Particle(random(windowWidth),random(windowHeight),random(-4,4),random(-4,4),0,0,random(1000,2000));
		particles.push(p);
	}
}
function draw() {
	background(0);
	fill(255,150);
	ellipse(cx,cy,40)
	calcNewton();
	for (var i = particles.length - 1; i >= 0; i--) {
		particles[i].render();
		particles[i].update();
		//particles[i].ins(random(-1,1),random(-1,1));
	}
	console.log(particles.length)

}
var mux,muy
function mousePressed(){
	mux=mouseX;
	muy=mouseY;
}
function mouseReleased() {
	var theta=Math.atan2(mouseY-muy,mouseX-mux);
	var d= dist(mouseX,mouseY,mux,muy);
	var vx=Math.cos(theta)*d/10;
	var vy=Math.sin(theta)*d/10;
	particles.push(new Particle(mux,muy,vx,vy,0,0,10))
}
function Particle(x,y,vx,vy,ax,ay,mass){
	this.x=x;
	this.y=y;
	this.vx=vx;
	this.vy=vy;
	this.ax=ax;
	this.ay=ay;
	this.mass=mass;
	this.r=Math.log(mass);

	this.render = function(){
		ellipse(this.x,this.y,this.r);
//		line(this.x,this.y,this.x+this.vx*5,this.y+this.vy*5)
}

}

Particle.prototype.updateAcc = function(ax,ay) {
	this.ax=ax;
	this.ay=ay;
}; 
Particle.prototype.update = function() {
	this.vx+=this.ax;
	this.vy+=this.ay;
	this.x+=this.vx;
	this.y+=this.vy;

//	if (this.x<0 || this.x>windowWidth) {this.vx=-this.vx;this.vx*=0.5}
//	if (this.y<0 || this.y>windowHeight) {this.vy=-this.vy;this.vy*=0.5}
}; 

function dist(a,b,c,d) {
	return(Math.sqrt((a-c)*(b-d)));
}

function calcNewton() {
	var pnum=particles.length;
	for (var i = pnum - 1; i >= 0; i--) {
		var bodyA=particles[i];
		var sum_ax=0,sum_ay=0;
		for (var j = pnum - 1; j >= 0; j--) {
			if(i!=j){
				var bodyB=particles[j];
				var d=dist(bodyA.x,bodyA.y,bodyB.x,bodyB.y);
				var dx=bodyB.x-bodyA.x;
				var dy=bodyB.y-bodyA.y;
				if(d>(bodyA.r+bodyB.r)){
					sum_ax += bodyB.mass*dx/(d*d*d); //Sum of GM*X/r*r*r
					sum_ay += bodyB.mass*dy/(d*d*d); //Sum of GM*Y/r*r*r					
				}
			}
		}

		r=dist(bodyA.x,bodyA.y,cx,cy); // repelent body
		if(r>10)
		{
			sum_ax+= -1000*(cx-bodyA.x)/(r*r*r);
			sum_ay+= -1000*(cy-bodyA.y)/(r*r*r);
		}



		particles[i].updateAcc(sum_ax,sum_ay);
		if(bodyA.x<0 || bodyA.y<0||bodyA.x>windowWidth || bodyA.y>windowHeight)
		{
			particles.splice(i,1);
			pnum--;
		}
	}
}
